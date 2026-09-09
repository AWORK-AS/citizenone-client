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
const MAX_POINTS_PER_BATCH = 500 // CitizenCareHourLocationLogBatchStoreRequest caps `points` at 500
const MAX_CONSECUTIVE_FLUSH_FAILURES = 3 // after this many failed flushes in a row, surface it

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
// Consecutive failed flushBuffer() calls. Reset to 0 on the first success;
// once it reaches MAX_CONSECUTIVE_FLUSH_FAILURES, status flips to
// 'tracking-degraded' with a localized trackingError — see flushBuffer().
let consecutiveFlushFailures = 0
// Bumped at the start of start()/stop()/cancel(). reconcile() snapshots this
// before its GET /active call and discards its result if the number has
// since moved on — otherwise a reconcile() issued on page load (before any
// trip exists) can resolve *after* the user has already started a new trip
// while it was in flight, and its stale "no trip running" answer would wipe
// out the trip that was just started.
let stateGeneration = 0
// Updated on every geolocation fix regardless of accuracy — purely for "where
// is the user right now" display purposes (map centering). Deliberately
// separate from `points`, which stays filtered for distance-calculation
// quality: a laptop without a GPS chip routinely reports accuracy in the
// hundreds/thousands of meters via wifi-based location, which would
// otherwise leave `points` permanently empty and the review map stuck on a
// hardcoded fallback center for the whole session.
const lastKnownPosition = ref<{ lat: number; lng: number; accuracy?: number } | null>(null)

// Increments exactly once per successful stop() — i.e. exactly when a trip
// actually changed on the server. Pages that list/summarize mileage logs
// should watch this directly rather than inferring "a trip was just saved"
// from a status transition like 'reviewing' -> 'idle': that transition only
// happens when the review modal is later closed, which is one step removed
// from the save itself and depends on a component elsewhere in the tree
// staying mounted with the same composable instance the whole time.
const tripSavedTick = ref(0)

// Ticks every second while tracking so `elapsedSeconds` below has an actual
// reactive dependency to recompute on — Date.now() alone isn't reactive, so
// without this the computed only evaluates once (whenever it's first read)
// and then stays frozen at that value forever, which is why the banner's
// timer was stuck instead of counting up.
const clockTick = ref(0)

let watchId: number | null = null
let logIntervalId: ReturnType<typeof setInterval> | null = null
let staleCheckId: ReturnType<typeof setInterval> | null = null
let clockIntervalId: ReturnType<typeof setInterval> | null = null
let lastLoggedPoint: { lat: number; lng: number } | null = null
let wakeLock: any = null
let listenersBound = false
// Set from the most recent useMileageTracking(t) call. flushBuffer() runs off
// a module-level setInterval (see startWatching()), outside any component's
// setup context, so it has no `t` of its own to localize trackingError with —
// this is the same t every mounted component already passes in.
let activeTranslate: ((key: string) => string) | undefined

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

/**
 * Returns to a clean idle state. Deliberately also tears down the geolocation
 * watcher, timers and wake lock: every caller that resets is ending the
 * session (review dismissed, trip cancelled, server says nothing is running),
 * and leaving those running leaked a live watchPosition + intervals that kept
 * pushing breadcrumbs for a trip that no longer exists locally. Safe to call
 * when nothing is running — stopWatching()/releaseWakeLock() are both no-ops
 * in that case.
 */
function resetState() {
    stopWatching()
    releaseWakeLock()
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
    lastKnownPosition.value = null
    consecutiveFlushFailures = 0
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

function localizeGlobal(key: string, fallback: string) {
    try {
        return activeTranslate ? activeTranslate(key) : fallback
    } catch {
        return fallback
    }
}

function distanceTrackedMeters(): number {
    if (points.value.length < 2) return 0
    let total = 0
    for (let i = 1; i < points.value.length; i++) {
        total += haversineDistanceMeters(points.value[i - 1], points.value[i])
    }
    return total
}

/**
 * Uploads `batch` in chronological 500-point slices (the server rejects the
 * whole request over that cap — CitizenCareHourLocationLogBatchStoreRequest).
 * Stops at the first slice that fails rather than skipping ahead: the points
 * are chronological, and sending a later slice after a failed one would punch
 * a hole in the middle of the trail the backend sums into a distance. Returns
 * how many leading points were actually accepted, so the caller can advance
 * its watermark by exactly that — never by the buffer's current length.
 */
async function uploadPoints(tripUuid: string, batch: BufferedPoint[]): Promise<number> {
    let accepted = 0
    for (let i = 0; i < batch.length; i += MAX_POINTS_PER_BATCH) {
        const slice = batch.slice(i, i + MAX_POINTS_PER_BATCH)
        try {
            await citizenCareHourLocationLogService.logLocationBatch({
                citizen_care_hour_uuid: tripUuid,
                points: slice.map((p) => ({ latitude: p.lat, longitude: p.lng, recorded_at: p.recordedAt })),
            })
        } catch {
            return accepted
        }
        accepted += slice.length
    }
    return accepted
}

async function flushBuffer(): Promise<number> {
    if (!activeTrip.value?.uuid) return 0
    // Snapshotted here, before the await below — onPosition() keeps pushing
    // into points.value for as long as the request is in flight, since the
    // geolocation watcher is still running. Advancing the watermark by
    // `accepted` (what uploadPoints() actually sent) rather than by
    // points.value.length afterwards is what keeps those points from being
    // marked flushed without ever having been uploaded.
    const unflushed = points.value.slice(lastFlushedIndex.value)
    if (unflushed.length === 0) return 0

    const accepted = await uploadPoints(activeTrip.value.uuid, unflushed)
    lastFlushedIndex.value += accepted
    persist()

    if (accepted === unflushed.length) {
        // Only clear status/trackingError if this flush is the thing that had
        // set them — a stale upload alert must go, but an unrelated error
        // (e.g. a failed stop()) sitting in the same ref must not be wiped by
        // an unrelated background flush succeeding underneath it.
        if (consecutiveFlushFailures >= MAX_CONSECUTIVE_FLUSH_FAILURES) {
            if (status.value === 'tracking-degraded') status.value = 'tracking'
            trackingError.value = null
        }
        consecutiveFlushFailures = 0
    } else {
        // Left in the buffer — will retry on the next flush trigger (interval,
        // visibility change, or online event). Don't alert on a single miss:
        // one dropped request on a mobile connection is normal and self-heals.
        consecutiveFlushFailures++
        if (consecutiveFlushFailures >= MAX_CONSECUTIVE_FLUSH_FAILURES) {
            status.value = 'tracking-degraded'
            trackingError.value = localizeGlobal(
                'mileageLog.tracking.errors.uploadDegraded',
                "Some GPS points haven't been saved yet — keep this tab open"
            )
        }
    }

    return accepted
}

function onPosition(position: GeolocationPosition) {
    const lat = position.coords.latitude
    const lng = position.coords.longitude
    const accuracy = position.coords.accuracy

    lastFixAt.value = Date.now()
    if (status.value === 'tracking-degraded') status.value = 'tracking'
    lastKnownPosition.value = { lat, lng, accuracy }

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
    // Idempotent: tear down any existing watcher/intervals first. reconcile()
    // calls this whenever it adopts a running trip, and it runs on every mount
    // of the tracking banner — which remounts more often than it looks, because
    // pages render the layout themselves (<NuxtLayout name="user"> lives inside
    // the page template), so navigating away and back recreates it. Without
    // this, each remount leaked another live watchPosition and another pair of
    // intervals, all writing to the same shared state.
    stopWatching()
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

    clockIntervalId = setInterval(() => {
        clockTick.value++
    }, 1000)
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
    if (clockIntervalId !== null) {
        clearInterval(clockIntervalId)
        clockIntervalId = null
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
    if (t) activeTranslate = t // see activeTranslate's declaration — flushBuffer() needs this outside setup context

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
    // A trip that's already been stopped server-side but whose review screen
    // hasn't been closed yet. The banner must stay reachable during this
    // state too — otherwise, if the component showing the review modal ever
    // unmounts (a page refresh, navigating away and back) before the user
    // clicks through it, there is no way back in to finish closing it out.
    const isReviewing = computed(() => status.value === 'reviewing')
    const isStopping = computed(() => status.value === 'stopping')
    /**
     * True for every state that represents an existing trip session, including
     * the transitional 'stopping'. This is what the tracking banner must key
     * its visibility off — NOT isTracking, which goes false the moment stop()
     * begins. Because the banner hosts the stop/review modal, a visibility
     * condition that excludes 'stopping' unmounts the banner (and the open
     * modal with it) for the several seconds stop()'s network calls take, then
     * remounts it when status reaches 'reviewing' — which re-fires the modal's
     * open watcher and makes the review screen appear twice. It also left a
     * window with no banner where a new trip could be started mid-stop.
     */
    const hasTripSession = computed(() =>
        ['tracking', 'tracking-degraded', 'stopping', 'reviewing'].includes(status.value)
    )
    const distanceSoFarKm = computed(() => Math.round((distanceTrackedMeters() / 1000) * 100) / 100)
    const elapsedSeconds = computed(() => {
        clockTick.value // reactive dependency — see the comment by its declaration
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
        const generationAtCallTime = stateGeneration
        try {
            const response = await mileageLogService.getActiveTrip()
            if (generationAtCallTime !== stateGeneration) return // superseded — see the comment by stateGeneration's declaration

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
        // 'reviewing' must NOT block a new trip. The trip it refers to was
        // already fully persisted by /stop — 'reviewing' is a purely
        // informational client-side screen ("here's what we saved"), not an
        // unsaved-work state. Treating it as blocking is what wedged this
        // feature repeatedly: any interruption to that screen (the component
        // unmounting, navigating away, the modal being dismissed by a route
        // change) left status stuck at 'reviewing' forever, and every later
        // Start silently did nothing until a full page reload. Starting a new
        // trip is itself an unambiguous "I'm done looking at that" signal, so
        // just drop the review and continue.
        if (status.value === 'reviewing') {
            resetState()
        }

        // What genuinely blocks a new trip: one that is actually live or
        // mid-transition ('starting'/'tracking'/'stopping'/...). Throw rather
        // than returning silently — a bare `return` resolves the promise
        // successfully, so the Start modal couldn't tell it apart from a real
        // start and showed a "trip started" toast while doing nothing.
        if (status.value !== 'idle') {
            trackingError.value = localize('mileageLog.tracking.errors.alreadyStarted', 'You already have a trip in progress')
            throw new Error(trackingError.value)
        }
        stateGeneration++
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
            // instead of surfacing this as a failure.
            //
            // Deliberately NOT falling back to a speculative getActiveTrip()
            // lookup when err.data is absent: that used to run for *any*
            // failure (a genuine validation error, a network hiccup,
            // anything), and if an unrelated trip happened to already be
            // active — e.g. an orphaned one left over from earlier testing —
            // it got silently adopted and returned as if the request had
            // succeeded. That masked real failures (confirmed: starting a
            // trip with a citizen linked could fail outright while still
            // showing a success toast, because some other stale trip got
            // adopted in its place) behind a false-positive "success".
            // Require actual evidence this was the 409-with-body case.
            const conflictTrip = err?.data?.uuid ? err.data : null
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
        stateGeneration++
        isBusy.value = true
        status.value = 'stopping'

        try {
            const pendingBeforeFinalFlush = points.value.length - lastFlushedIndex.value
            const accepted = await flushBuffer()
            if (accepted < pendingBeforeFinalFlush) {
                // Mirrors the mobile app's toast on a failed final flush before
                // /stop — the trip is still saved, just with a shorter tracked
                // distance than what was actually driven.
                trackingError.value = localize(
                    'mileageLog.tracking.errors.uploadIncomplete',
                    'Some GPS points were not saved — the distance for this trip may be lower than you drove'
                )
            }
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

            // Write the final trip (correct kilometers, end_address, etc.)
            // back into the shared activeTrip ref rather than leaving it
            // holding pre-stop data — this is what makes activeTrip a
            // reliable source for the review screen even if the component
            // showing it gets unmounted/remounted (e.g. a page refresh)
            // while status is still 'reviewing', instead of relying on a
            // component-local copy that a remount would lose entirely.
            if (result?.data) activeTrip.value = result.data
            stopWatching()
            releaseWakeLock()
            status.value = 'reviewing'
            tripSavedTick.value++
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
        resetState() // also tears down watcher/timers/wake lock — see resetState()
    }

    async function cancel() {
        stateGeneration++
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
            resetState() // also tears down watcher/timers/wake lock
            isBusy.value = false
        }
    }

    return {
        status,
        activeTrip,
        points,
        lastKnownPosition,
        tripSavedTick,
        isTracking,
        isReviewing,
        isStopping,
        hasTripSession,
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
