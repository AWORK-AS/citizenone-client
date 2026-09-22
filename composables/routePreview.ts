import { ref } from 'vue'
import { mileageLogService } from '@/components/api/user/MileageLogService'

export interface RouteCoordinate {
    lat: number
    lng: number
}

export type RoutePreviewStatus = 'idle' | 'calculating' | 'ready' | 'unavailable'

export interface RoutePreviewState {
    status: RoutePreviewStatus
    kilometers: number | null
    hasFerry: boolean
    ferryKilometers: number
    message: string | null
    /** Road geometry as [lat, lng] pairs, ready to hand straight to MapLocation's polylinePoints. Only set once status is 'ready'. */
    coordinates: Array<[number, number]> | null
}

/**
 * The backend returns [lat, lng] pairs (flipped from GeoJSON's [lng, lat] on
 * that side, since Leaflet -- the only consumer -- wants [lat, lng]).
 * Re-validated here rather than trusted blindly: a malformed pair would
 * otherwise crash Leaflet's polyline renderer instead of just omitting a line.
 */
function parseCoordinates(raw: any): Array<[number, number]> | null {
    if (!Array.isArray(raw)) return null

    const points: Array<[number, number]> = []
    for (const pair of raw) {
        if (!Array.isArray(pair) || pair.length < 2) return null
        const lat = Number(pair[0])
        const lng = Number(pair[1])
        if (Number.isNaN(lat) || Number.isNaN(lng)) return null
        points.push([lat, lng])
    }
    return points
}

const DEBOUNCE_MS = 400

/**
 * Asks the backend for the real (OSRM) road distance of a trip instead of
 * computing a straight-line estimate client-side — see
 * composables/tripDistance.ts for why that under-reports badly.
 *
 * Debounce + race-guard pattern copied from composables/addressSearch.ts: an
 * incrementing sequence number plus an AbortController so that reordering
 * stops rapidly (or typing quickly, which replaces the whole stops array on
 * every keystroke) never lets a slow, superseded response overwrite a newer
 * one.
 */
export function useRoutePreview(t?: (key: string) => string) {
    const state = ref<RoutePreviewState>({
        status: 'idle',
        kilometers: null,
        hasFerry: false,
        ferryKilometers: 0,
        message: null,
        coordinates: null,
    })

    let seq = 0
    let timer: ReturnType<typeof setTimeout> | null = null
    let abortController: AbortController | null = null

    function localize(key: string, fallback: string) {
        try {
            return t ? t(key) : fallback
        } catch {
            return fallback
        }
    }

    function clearTimer() {
        if (timer) {
            clearTimeout(timer)
            timer = null
        }
    }

    /** Call when the stops aren't all resolved yet — clears back to idle. */
    function reset() {
        seq++ // invalidates any pending timer or in-flight response
        clearTimer()
        abortController?.abort()
        abortController = null
        state.value = { status: 'idle', kilometers: null, hasFerry: false, ferryKilometers: 0, message: null, coordinates: null }
    }

    /**
     * `coordinates` must already be the full ordered chain (start, then any
     * middle stops, then end) with every entry resolved to lat/lng — the
     * caller is responsible for that check (see form.vue's watcher).
     */
    function request(coordinates: RouteCoordinate[]) {
        clearTimer()
        abortController?.abort()

        const mySeq = ++seq
        // A full reset, not just the status: a stale route (or distance) left
        // over from the previous answer must never sit on screen next to
        // stops it no longer corresponds to.
        state.value = { status: 'calculating', kilometers: null, hasFerry: false, ferryKilometers: 0, message: null, coordinates: null }

        timer = setTimeout(async () => {
            if (mySeq !== seq) return
            abortController = new AbortController()

            try {
                const response = await mileageLogService.previewRoute(
                    { coordinates: coordinates.map((c) => ({ latitude: c.lat, longitude: c.lng })) },
                    abortController.signal,
                )
                if (mySeq !== seq) return

                const data = response?.data ?? {}
                state.value = {
                    status: 'ready',
                    kilometers: data.kilometers ?? 0,
                    hasFerry: !!data.has_ferry,
                    ferryKilometers: data.ferry_kilometers ?? 0,
                    message: null,
                    coordinates: parseCoordinates(data.coordinates),
                }
            } catch (err: any) {
                if (err?.name === 'AbortError' || mySeq !== seq) return

                // Never fall back to a straight-line number here — a quietly
                // wrong distance is the exact problem this replaces.
                state.value = {
                    status: 'unavailable',
                    kilometers: null,
                    hasFerry: false,
                    ferryKilometers: 0,
                    coordinates: null,
                    message: err?.message || localize('mileageLog.form.distanceUnavailable', 'Distance could not be calculated.'),
                }
            }
        }, DEBOUNCE_MS)
    }

    return { state, request, reset }
}

export default useRoutePreview
