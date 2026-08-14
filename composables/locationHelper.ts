import { ref } from 'vue'
import { useAddressSearch } from '@/composables/addressSearch'

export type LocationResult = {
    success: boolean
    latitude?: number
    longitude?: number
    address?: string | null
    error?: string
    code?: number
}

export type LocatorOptions = {
    enableHighAccuracy?: boolean
    timeout?: number
    maximumAge?: number
}

export function useLocationHelper(t?: (key: string) => string) {
    const isLocating = ref(false)
    const error = ref<string | null>(null)

    function _localize(key: string, fallback: string) {
        try {
            return t ? t(key) : fallback
        } catch {
            return fallback
        }
    }

    function getPosition(opts: LocatorOptions = {}): Promise<GeolocationPosition> {
        return new Promise((resolve, reject) => {
            if (!('geolocation' in navigator)) {
                reject({ code: -1, message: _localize('citizens.timeRegistration.registerTransport.errors.geolocationNotSupported', 'Geolocation not supported') })
                return
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: opts.enableHighAccuracy ?? true,
                timeout: opts.timeout ?? 10000,
                maximumAge: opts.maximumAge ?? 0,
            })
        })
    }

    async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
                lat
            )}&lon=${encodeURIComponent(lng)}&addressdetails=0`

            const resp = await fetch(url, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    // Consider adding a user-agent or contact email for production usage
                },
            })

            // Handle explicit rate-limit / too-early responses: surface a message via error ref
            if (resp.status === 425 || resp.status === 429) {
                const msg = _localize(
                    'citizens.timeRegistration.registerTransport.errors.reverseGeocodeRateLimited',
                    'Reverse geocoding is temporarily rate-limited. Please try again in a moment.'
                )
                error.value = msg
                return null
            }

            if (!resp.ok) {
                // for other non-ok statuses, don't treat as rate-limit; return null silently
                return null
            }

            const data = await resp.json()
            if (data && (data.display_name || data.name)) {
                return data.display_name || data.name
            }

            return null
        } catch {
            return null
        }
    }

    /**
     * Get current location and attempt to reverse-geocode it.
     * Returns a LocationResult object and does not throw.
     */
    async function getLocationAndAddress(opts: LocatorOptions = {}): Promise<LocationResult> {
        error.value = null
        isLocating.value = true

        try {
            const pos = await getPosition(opts)
            const lat = pos.coords.latitude
            const lng = pos.coords.longitude

            // Try reverse geocoding, but tolerate failure (return coords anyway)
            const address = await reverseGeocode(lat, lng)

            return {
                success: true,
                latitude: lat,
                longitude: lng,
                address: address ?? null,
            }
        } catch (err: any) {
            // err may be a GeolocationPositionError or our custom rejection object
            let message = _localize('citizens.timeRegistration.registerTransport.errors.unableToLocate', 'Unable to get location')
            let code: number | undefined = undefined

            if (err && typeof err === 'object') {
                if (typeof err.code === 'number') {
                    code = err.code
                    // GeolocationPositionError codes:
                    // 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
                    if (err.code === 1) {
                        message = _localize('citizens.timeRegistration.registerTransport.errors.permissionDenied', 'Permission denied to access location')
                    } else if (err.code === 2) {
                        message = _localize('citizens.timeRegistration.registerTransport.errors.positionUnavailable', 'Position unavailable')
                    } else if (err.code === 3) {
                        message = _localize('citizens.timeRegistration.registerTransport.errors.timeout', 'Location request timed out')
                    } else if (err.code === -1 && typeof err.message === 'string') {
                        // our custom rejection when geolocation is not supported
                        message = err.message
                    }
                } else if (typeof err.message === 'string') {
                    message = err.message
                }
            }

            error.value = message

            return {
                success: false,
                error: message,
                code,
            }
        } finally {
            isLocating.value = false
        }
    }

    /**
     * Geocode: convert address string to coordinates.
     *
     * @deprecated New code should call useAddressSearch() directly — it
     * exposes suggestions (not just the first result), which is the whole
     * point of the mileage-log address-entry rework: taking a geocoder's
     * first result blindly picks the wrong address often enough to matter
     * (verified: "Nørrebrogade 155" ranks "Nørrebrogade 55, Vejle" first).
     * This wrapper exists only so the five pre-existing call sites
     * (modal-locate-citizen.vue, check-in-out.vue, details-header.vue,
     * pages/citizens/index.vue) keep working — and now resolve DK addresses
     * via Adressevælgeren instead of Nominatim — without themselves being
     * rewritten to a suggestion-list UI in this change.
     *
     * @param address - the address to geocode
     * @returns { lat, lng } or null
     */
    async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
        if (!address || address.trim().length === 0) {
            return null
        }

        isLocating.value = true
        error.value = null

        try {
            const addressSearch = useAddressSearch(t)
            const results = await addressSearch.search(address, { limit: 1 })
            if (addressSearch.searchError.value) {
                error.value = addressSearch.searchError.value
                return null
            }
            if (results.length === 0) {
                error.value = 'not-found'
                return null
            }

            const resolved = await addressSearch.resolveSuggestion(results[0])
            if (!resolved) {
                error.value = 'not-found'
                return null
            }

            return { lat: resolved.lat, lng: resolved.lng }
        } catch (err) {
            error.value = 'error'
            return null
        } finally {
            isLocating.value = false
        }
    }

    return {
        isLocating,
        error,
        getPosition,
        reverseGeocode,
        geocode,
        getLocationAndAddress,
    }
}

export default useLocationHelper