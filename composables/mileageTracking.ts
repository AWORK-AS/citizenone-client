import { ref, computed } from 'vue'
import { mileageLogService } from '@/components/api/user/MileageLogService'
import { citizenCareHourLocationLogService } from '@/components/api/user/CitizenCareHourLocationLogService'
import { useLocationHelper } from '@/composables/locationHelper'
import { haversineDistanceMeters } from '@/composables/geo'

/**
 * Live "Start tur / Stop tur" GPS trip tracking for the mileage log.
 *
 * Deliberately NOT built on composables/locationTracking.ts: that composable
 * declares its refs *inside* the factory function while every instance writes
 * the same localStorage key (`location_tracking_state`) — a user checked in
 * to a citizen *and* driving a tracked mileage trip at the same time would
 * have one session silently overwrite the other's persisted state. Here the
 * state is module-level (declared once, outside useMileageTracking()), so
 * every component that calls useMileageTracking() shares one live session —
 * the tracking banner in the layout and the mileage-log page see the same
 * watchPosition, the same buffer, the same status.
 *
 * See backend/dev.md ("Live GPS trip tracking for the mileage log") for the
 * server contract this drives against.
 */

export type TrackingStatus =
    | 'idle'
    | 'requesting-permission'
    | 'acquiring-start-fix'
    | 'starting'
    | 'tracking'
    | 'tracking-degraded' // no GPS fix for a while, session still alive
    | 'stopping'
    | 'reviewing' // trip already stopped server-side; user is editing details before final save

export interface BufferedPoint {
    lat: number
    lng: number
    recordedAt: string // ISO
    accuracy?: number
}

export interface PersistedTrackingState {
    tripUuid: string
    startedAt: string
    startLat: number
    startLng: number
    startAddress: string | null
    citizenUuid: string | null
    points: BufferedPoint[]
    lastFlushedIndex: number
    lastFixAt: number | null
}

const STORAGE_KEY = 'mileage_trip_tracking_state'
const LOG_INTERVAL_MS = 30000
const MIN_MOVEMENT_METERS = 10
const MAX_ACCURACY_METERS = 50 // drop fixes worse than this — the highest-leverage jitter fix
const GPS_STALE_AFTER_MS = 90000 // no fix for this long -> "GPS paused" chip

// --- module-level singleton state -----------------------------------------
const status = ref<TrackingStatus>('idle')
const activeTrip = ref<any>(null) // CitizenCareHourResource-shaped, once started
const points = ref<BufferedPoint[]>([])
const lastFlushedIndex = ref(0)
const lastFixAt = ref<number | null>(null)
const startedAt = ref<string | null>(null)
const startCoords = ref<{ lat: number; lng: number } | null>(null)
const startAddress = ref<string | null>(null)
const citizenUuid = ref<string | null>(null)
const trackingError = ref<string | null>(null)
const isBusy = ref(false) // true while start()/stop()/cancel() are in flight

let watchId: number | null = null
let logIntervalId: ReturnType<typeof setInterval> | null = null
let staleCheckId: ReturnType<typeof setInterval> | null = null
let lastLoggedPoint: { lat: number; lng: number } | null = null
let wakeLock: any = null
let listenersBound = false

function persist() {
    if (typeof window === 'undefined') return
    if (status.value === 'idle') {
        localStorage.removeItem(STORAGE_KEY)
        return
    }
    if (!activeTrip.value?.uuid || !startCoords.value || !startedAt.value) return

    const state: PersistedTrackingState = {
        tripUuid: activeTrip.value.uuid,
        startedAt: startedAt.value,
        startLat: startCoords.value.lat,
        startLng: startCoords.value.lng,
        startAddress: startAddress.value,
        citizenUuid: citizenUuid.value,
        points: points.value,
        lastFlushedIndex: lastFlushedIndex.value,
        lastFixAt: lastFixAt.value,
    }
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
        // localStorage full/unavailable — tracking still works in-memory for this tab
    }
}

function loadPersisted(): PersistedTrackingState | null {
    if (typeof window === 'undefined') return null
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

function clearPersisted() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
}

function resetState() {
    status.value = 'idle'
    activeTrip.value = null
    points.value = []
    lastFlushedIndex.value = 0
    lastFixAt.value = null
    startedAt.value = null
    startCoords.value = null
    startAddress.value = null
    citizenUuid.value = null
    trackingError.value = null
    clearPersisted()
}

async function requestWakeLock() {
    try {
        // @ts-ignore — Wake Lock API isn't in the lib.dom typings this project targets
        if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
            // @ts-ignore
            wakeLock = await navigator.wakeLock.request('screen')
        }
    } catch {
        wakeLock = null // not fatal — tracking still works, just more likely to be throttled
    }
}

function releaseWakeLock() {
    try {
        wakeLock?.release?.()
    } catch {
        // ignore
    }
    wakeLock = null
}

function distanceTrackedMeters(): number {
    if (points.value.length < 2) return 0
    let total = 0
    for (let i = 1; i < points.value.length; i++) {
        total += haversineDistanceMeters(points.value[i - 1], points.value[i])
    }
    return total
}

async function flushBuffer() {
    if (!activeTrip.value?.uuid) return
    const unflushed = points.value.slice(lastFlushedIndex.value)
    if (unflushed.length === 0) return

    try {
        await citizenCareHourLocationLogService.logLocationBatch({
            citizen_care_hour_uuid: activeTrip.value.uuid,
            points: unflushed.map((p) => ({ latitude: p.lat, longitude: p.lng, recorded_at: p.recordedAt })),
        })
        lastFlushedIndex.value = points.value.length
        persist()
    } catch {
        // Left in the buffer — will retry on the next flush trigger (interval,
        // visibility change, or online event).
    }
}

function onPosition(position: GeolocationPosition) {
    const lat = position.coords.latitude
    const lng = position.coords.longitude
    const accuracy = position.coords.accuracy

    lastFixAt.value = Date.now()
    if (status.value === 'tracking-degraded') status.value = 'tracking'

    if (typeof accuracy === 'number' && accuracy > MAX_ACCURACY_METERS) {
        // Drop low-quality fixes rather than let them jitter the distance —
        // the single highest-leverage quality fix for this feature.
        return
    }

    if (lastLoggedPoint) {
        const moved = haversineDistanceMeters(lastLoggedPoint, { lat, lng })
        if (moved < MIN_MOVEMENT_METERS) return
    }

    lastLoggedPoint = { lat, lng }
    points.value.push({ lat, lng, recordedAt: new Date().toISOString(), accuracy })
    persist()
}

function onPositionError() {
    // Swallow — a transient GPS error shouldn't kill the session. The stale
    // watcher below surfaces "GPS paused" if fixes stop arriving for a while.
}

function startWatching() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    watchId = navigator.geolocation.watchPosition(onPosition, onPositionError, {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000,
    })

    logIntervalId = setInterval(() => {
        flushBuffer()
    }, LOG_INTERVAL_MS)

    staleCheckId = setInterval(() => {
        if (status.value !== 'tracking' && status.value !== 'tracking-degraded') return
        if (lastFixAt.value !== null && Date.now() - lastFixAt.value > GPS_STALE_AFTER_MS) {
            status.value = 'tracking-degraded'
        }
    }, 15000)
}

function stopWatching() {
    if (watchId !== null && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(watchId)
        watchId = null
    }
    if (logIntervalId !== null) {
        clearInterval(logIntervalId)
        logIntervalId = null
    }
    if (staleCheckId !== null) {
        clearInterval(staleCheckId)
        staleCheckId = null
    }
    lastLoggedPoint = null
}

function bindLifecycleListeners() {
    if (listenersBound || typeof document === 'undefined') return
    listenersBound = true

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') return
        if (status.value === 'tracking' || status.value === 'tracking-degraded') {
            requestWakeLock()
            flushBuffer()
        }
    })

    window.addEventListener('online', () => {
        if (status.value === 'tracking' || status.value === 'tracking-degraded') {
            flushBuffer()
        }
    })

    window.addEventListener('pagehide', () => {
        persist()
    })
}

export function useMileageTracking(t?: (key: string) => string) {
    bindLifecycleListeners()

    const { getPosition, reverseGeocode, getLocationAndAddress } = useLocationHelper(t)

    function localize(key: string, fallback: string) {
        try {
            return t ? t(key) : fallback
        } catch {
            return fallback
        }
    }

    const isTracking = computed(() => status.value === 'tracking' || status.value === 'tracking-degraded')
    const isIdle = computed(() => status.value === 'idle')
    const distanceSoFarKm = computed(() => Math.round((distanceTrackedMeters() / 1000) * 100) / 100)
    const elapsedSeconds = computed(() => {
        if (!startedAt.value) return 0
        return Math.max(0, Math.floor((Date.now() - new Date(startedAt.value).getTime()) / 1000))
    })

    /**
     * Reconciles local state against the server on app boot. The server is
     * always the source of truth: if it has a running trip we don't know
     * about (new device, cleared storage), adopt it; if we think we're
     * tracking but the server disagrees (cancelled/auto-finalized elsewhere),
     * clear local state silently.
     */
    async function reconcile() {
        try {
            const response = await mileageLogService.getActiveTrip()
            // NOT `response?.data ?? response` — the endpoint legitimately
            // returns `{ data: null }` when nothing is running, and that
            // fallback would then resolve to the (truthy) wrapper object
            // instead of null, making "no active trip" look like a trip.
            const serverTrip = response?.data ?? null

            if (!serverTrip) {
                if (status.value !== 'idle') resetState()
                return
            }

            const persisted = loadPersisted()
            activeTrip.value = serverTrip
            startedAt.value = serverTrip.trip_started_at ?? persisted?.startedAt ?? new Date().toISOString()
            startCoords.value = {
                lat: persisted?.startLat ?? serverTrip.geo_start_lat,
                lng: persisted?.startLng ?? serverTrip.geo_start_lng,
            }
            startAddress.value = persisted?.startAddress ?? serverTrip.start_address ?? null
            citizenUuid.value = persisted?.citizenUuid ?? serverTrip.citizen?.uuid ?? null
            points.value = persisted?.tripUuid === serverTrip.uuid ? persisted.points : []
            lastFlushedIndex.value = persisted?.tripUuid === serverTrip.uuid ? persisted.lastFlushedIndex : 0
            lastFixAt.value = persisted?.lastFixAt ?? null

            status.value = 'tracking'
            persist()
            startWatching()
            requestWakeLock()
        } catch {
            // Network hiccup on boot — leave whatever local state we have; the
            // next reconcile() call (or explicit user action) will retry.
        }
    }

    async function start(opts: { citizenUuid?: string | null; note?: string } = {}) {
        if (status.value !== 'idle') return
        trackingError.value = null
        status.value = 'requesting-permission'
        isBusy.value = true

        try {
            status.value = 'acquiring-start-fix'
            // getLocationAndAddress() (not raw getPosition()) so a permission
            // denial / timeout / unsupported-browser error comes back through
            // its already-localized error strings rather than a raw
            // GeolocationPositionError message. It also tolerates a failed
            // reverse-geocode without failing the whole call — success stays
            // true with address: null, which is exactly what we want here:
            // never block starting a trip on a slow/rate-limited geocoder.
            const located = await getLocationAndAddress({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 })
            if (!located.success) {
                throw new Error(located.error || localize('mileageLog.tracking.errors.startFailed', 'Could not start the trip'))
            }
            const lat = located.latitude!
            const lng = located.longitude!

            status.value = 'starting'
            const resolvedAddress: string | null = located.address ?? null

            const response = await mileageLogService.startTrip({
                geo_start_lat: lat,
                geo_start_lng: lng,
                start_address: resolvedAddress,
                citizen_uuid: opts.citizenUuid ?? null,
                note: opts.note ?? null,
            })

            const trip = response?.data
            activeTrip.value = trip
            startedAt.value = trip.trip_started_at ?? new Date().toISOString()
            startCoords.value = { lat, lng }
            startAddress.value = resolvedAddress
            citizenUuid.value = opts.citizenUuid ?? null
            points.value = []
            lastFlushedIndex.value = 0
            lastFixAt.value = Date.now()

            status.value = 'tracking'
            persist()
            startWatching()
            requestWakeLock()
        } catch (err: any) {
            // A 409 ("you already have an active trip") carries that trip as
            // err.data (see backend/dev.md and APIError.data) — adopt it
            // instead of surfacing this as a failure. Fall back to an
            // explicit getActiveTrip() lookup if the error didn't carry a
            // usable body, so a conflict is still recoverable either way.
            const conflictTrip = err?.data ?? (await mileageLogService.getActiveTrip().catch(() => null))?.data
            if (conflictTrip) {
                activeTrip.value = conflictTrip
                startedAt.value = conflictTrip.trip_started_at ?? new Date().toISOString()
                startCoords.value = { lat: conflictTrip.geo_start_lat, lng: conflictTrip.geo_start_lng }
                startAddress.value = conflictTrip.start_address ?? null
                citizenUuid.value = conflictTrip.citizen?.uuid ?? null
                points.value = []
                lastFlushedIndex.value = 0
                lastFixAt.value = null

                status.value = 'tracking'
                persist()
                startWatching()
                requestWakeLock()
                return
            }

            status.value = 'idle'
            trackingError.value = err?.error
                || err?.message
                || localize('mileageLog.tracking.errors.startFailed', 'Could not start the trip')
            throw err
        } finally {
            isBusy.value = false
        }
    }

    /**
     * Stops the trip server-side immediately (point of no return, by design —
     * see backend/dev.md: the alternative of reviewing before stopping
     * reintroduces the same data-loss window a client-only session would
     * have). The caller then gets a 'reviewing' window to edit address/note/
     * citizen before the trip is considered final; there is nothing further
     * to "save" server-side beyond that edit, since /stop already persisted it.
     */
    async function stop(opts: { endAddress?: string | null; note?: string; citizenUuid?: string | null; useBreadcrumbs?: boolean } = {}) {
        if (!isTracking.value || !activeTrip.value?.uuid) return null
        isBusy.value = true
        status.value = 'stopping'

        try {
            await flushBuffer()
            const position = await getPosition({ enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }).catch(() => null)
            const lat = position?.coords.latitude ?? startCoords.value?.lat
            const lng = position?.coords.longitude ?? startCoords.value?.lng

            let endAddress = opts.endAddress ?? null
            if (!endAddress && lat !== undefined && lng !== undefined) {
                endAddress = await reverseGeocode(lat as number, lng as number).catch(() => null)
            }

            const result = await mileageLogService.stopTrip(activeTrip.value.uuid, {
                geo_end_lat: lat,
                geo_end_lng: lng,
                end_address: endAddress,
                note: opts.note ?? null,
                citizen_uuid: opts.citizenUuid ?? citizenUuid.value ?? null,
                use_breadcrumbs: opts.useBreadcrumbs ?? true,
            })

            stopWatching()
            releaseWakeLock()
            status.value = 'reviewing'
            return result?.data
        } catch (err: any) {
            // Stop failed server-side — stay in 'tracking' so the user can retry
            // rather than silently losing the session.
            status.value = 'tracking'
            trackingError.value = err?.error
                || err?.message
                || localize('mileageLog.tracking.errors.stopFailed', 'Could not stop the trip — try again')
            throw err
        } finally {
            isBusy.value = false
        }
    }

    /** Called once the review modal is dismissed (whether saved or not). */
    function finishReview() {
        stopWatching()
        releaseWakeLock()
        resetState()
    }

    async function cancel() {
        if (!activeTrip.value?.uuid) {
            resetState()
            return
        }
        isBusy.value = true
        try {
            await mileageLogService.cancelTrip(activeTrip.value.uuid)
        } catch {
            // Even if the server call fails, clear local state — the user
            // explicitly asked to discard, and staying "stuck" tracking is worse.
        } finally {
            stopWatching()
            releaseWakeLock()
            resetState()
            isBusy.value = false
        }
    }

    return {
        status,
        activeTrip,
        points,
        isTracking,
        isIdle,
        isBusy,
        trackingError,
        distanceSoFarKm,
        elapsedSeconds,
        startAddress,
        citizenUuid,
        reconcile,
        start,
        stop,
        cancel,
        finishReview,
    }
}

export default useMileageTracking
