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
        state.value = { status: 'idle', kilometers: null, hasFerry: false, ferryKilometers: 0, message: null }
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
        state.value = { ...state.value, status: 'calculating' }

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
                    message: err?.message || localize('mileageLog.form.distanceUnavailable', 'Distance could not be calculated.'),
                }
            }
        }, DEBOUNCE_MS)
    }

    return { state, request, reset }
}

export default useRoutePreview
