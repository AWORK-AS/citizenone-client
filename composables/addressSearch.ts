import { ref } from 'vue'
import { utm32nToWgs84 } from '@/composables/geo'

/**
 * Danish address autocomplete + non-DK fallback geocoding.
 *
 * Provider chain: Adressevælgeren (Klimadatastyrelsen) first, Nominatim second.
 *
 * DAWA (Danmarks Adressers Web API) — the address API this codebase used to
 * reach for — closes its address endpoints on 2026-08-17. Adressevælgeren is
 * the official replacement, but its /soeg endpoint returns no coordinates;
 * selecting a suggestion requires a second call to resolve it, whose
 * coordinates come back in EPSG:25832 (UTM zone 32N) rather than WGS84 — see
 * utm32nToWgs84() in composables/geo.ts.
 *
 * Nominatim's usage policy forbids per-keystroke autocomplete (max ~1 req/s,
 * no bulk/live-search use), so it is used only as a slow, heavily-debounced
 * fallback when the Danish tier returns nothing — e.g. non-Danish addresses.
 */

export type AddressProvider = 'adressevaelger' | 'nominatim'

export interface AddressSuggestion {
    /** Provider-scoped stable id — used as :key and for aria ids. */
    id: string
    /** Full display text; becomes the stop's address text once selected. */
    label: string
    /** Emphasised line, e.g. "Rentemestervej 5". */
    primary: string
    /** Muted line, e.g. "2400 København NV". */
    secondary: string
    /** null until resolved — Adressevælgeren's search step returns no coords. */
    lat: number | null
    lng: number | null
    provider: AddressProvider
}

export interface ResolvedAddressSuggestion extends AddressSuggestion {
    lat: number
    lng: number
}

export interface AddressSearchOptions {
    limit?: number
    signal?: AbortSignal
}

const ADRESSEVAELGER_BASE = 'https://adressevaelger.dk'
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'

// Nominatim's usage policy caps free-form use at ~1 req/s. This floor is
// module-level (not per component instance) because one autocomplete mounts
// per trip stop — the policy applies to the whole app, not to one field.
const NOMINATIM_MIN_INTERVAL_MS = 1100
let lastNominatimAt = 0

// Bounded memoisation of Adressevælgeren id -> resolved coordinates. The same
// address is frequently re-picked across stops and across trips.
const resolveCache = new Map<string, ResolvedAddressSuggestion>()
const RESOLVE_CACHE_MAX = 200

function cacheResolved(key: string, value: ResolvedAddressSuggestion) {
    if (resolveCache.size >= RESOLVE_CACHE_MAX) {
        const oldestKey = resolveCache.keys().next().value
        if (oldestKey !== undefined) resolveCache.delete(oldestKey)
    }
    resolveCache.set(key, value)
}

/**
 * Deliberately NOT vue-i18n's useI18n().locale: that composable must be
 * called synchronously during a component's setup(), but search()/
 * searchDebounced() run later (timers, event handlers) and geocode() in
 * locationHelper.ts calls useAddressSearch() lazily too — calling useI18n()
 * from any of those call sites would hit Vue's "must be called in setup()"
 * constraint. navigator.language needs no such context.
 */
function browserLocale(): string | undefined {
    try {
        return typeof navigator !== 'undefined' ? navigator.language : undefined
    } catch {
        return undefined
    }
}

function splitOnLastComma(text: string): { primary: string; secondary: string } {
    const idx = text.lastIndexOf(', ')
    if (idx === -1) return { primary: text, secondary: '' }
    return { primary: text.slice(0, idx), secondary: text.slice(idx + 2) }
}

function getAdressevaelgerToken(): string {
    try {
        const config = useRuntimeConfig()
        return (config.public.adressevaelgerToken as string) || 'adressevaelger123'
    } catch {
        return 'adressevaelger123'
    }
}

async function searchAdressevaelger(query: string, opts: AddressSearchOptions): Promise<AddressSuggestion[]> {
    const token = getAdressevaelgerToken()
    const url = `${ADRESSEVAELGER_BASE}/husnumre/soeg?tekst=${encodeURIComponent(query)}&token=${encodeURIComponent(token)}&maksimum=${opts.limit ?? 8}`

    const response = await fetch(url, { signal: opts.signal })
    if (!response.ok) throw new Error(`Adressevælger search failed: ${response.status}`)

    const data = await response.json()
    const fund: any[] = Array.isArray(data?.fund) ? data.fund : []

    return fund
        .filter((row) => row?.type === 'husnummer' && row?.id && row?.titel)
        .map((row) => {
            const { primary, secondary } = splitOnLastComma(row.titel)
            return {
                id: `adressevaelger:${row.id}`,
                label: row.titel,
                primary,
                secondary,
                lat: null,
                lng: null,
                provider: 'adressevaelger' as const,
            }
        })
}

async function resolveAdressevaelger(suggestion: AddressSuggestion, signal?: AbortSignal): Promise<ResolvedAddressSuggestion | null> {
    const cached = resolveCache.get(suggestion.id)
    if (cached) return cached

    const rawId = suggestion.id.replace(/^adressevaelger:/, '')
    const token = getAdressevaelgerToken()
    const url = `${ADRESSEVAELGER_BASE}/husnumre/${encodeURIComponent(rawId)}?token=${encodeURIComponent(token)}`

    const response = await fetch(url, { signal })
    if (!response.ok) return null

    const data = await response.json()
    const koordinater = data?.husnummer?.adgangspunkt?.koordinater
    if (!koordinater || typeof koordinater.x !== 'number' || typeof koordinater.y !== 'number') return null

    const wgs84 = utm32nToWgs84(koordinater.x, koordinater.y)
    if (!wgs84) return null

    const resolved: ResolvedAddressSuggestion = { ...suggestion, lat: wgs84.lat, lng: wgs84.lng }
    cacheResolved(suggestion.id, resolved)
    return resolved
}

async function searchNominatim(query: string, opts: AddressSearchOptions, locale?: string): Promise<AddressSuggestion[]> {
    const url = `${NOMINATIM_SEARCH_URL}?format=jsonv2&addressdetails=1&limit=${opts.limit ?? 8}&q=${encodeURIComponent(query)}`
    lastNominatimAt = Date.now()

    const response = await fetch(url, {
        signal: opts.signal,
        headers: {
            Accept: 'application/json',
            ...(locale ? { 'Accept-Language': locale } : {}),
        },
    })

    if (response.status === 429 || response.status === 425) {
        const err: any = new Error('rate-limited')
        err.rateLimited = true
        throw err
    }
    if (!response.ok) throw new Error(`Nominatim search failed: ${response.status}`)

    const data: any[] = await response.json()
    return (data || []).map((row) => {
        const label = row.display_name as string
        const { primary, secondary } = splitOnLastComma(label)
        return {
            id: `osm:${row.osm_type}:${row.osm_id}`,
            label,
            primary,
            secondary,
            lat: parseFloat(row.lat),
            lng: parseFloat(row.lon),
            provider: 'nominatim' as const,
        }
    })
}

export function useAddressSearch(t?: (key: string) => string) {
    const suggestions = ref<AddressSuggestion[]>([])
    const isSearching = ref(false)
    const activeProvider = ref<AddressProvider | null>(null)
    const searchError = ref<string | null>(null)

    let requestSeq = 0
    let abortController: AbortController | null = null
    let danishTimer: ReturnType<typeof setTimeout> | null = null
    let nominatimTimer: ReturnType<typeof setTimeout> | null = null

    function localize(key: string, fallback: string) {
        try {
            return t ? t(key) : fallback
        } catch {
            return fallback
        }
    }

    function clearTimers() {
        if (danishTimer) { clearTimeout(danishTimer); danishTimer = null }
        if (nominatimTimer) { clearTimeout(nominatimTimer); nominatimTimer = null }
    }

    function cancel() {
        clearTimers()
        abortController?.abort()
        abortController = null
    }

    function clear() {
        cancel()
        suggestions.value = []
        activeProvider.value = null
        searchError.value = null
        isSearching.value = false
    }

    async function runNominatimFallback(trimmed: string, seq: number, opts: AddressSearchOptions) {
        const wait = Math.max(0, NOMINATIM_MIN_INTERVAL_MS - (Date.now() - lastNominatimAt))
        if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
        if (seq !== requestSeq) return

        try {
            const fallback = await searchNominatim(trimmed, opts, browserLocale())
            if (seq !== requestSeq) return

            suggestions.value = fallback
            activeProvider.value = fallback.length > 0 ? 'nominatim' : null
        } catch (err: any) {
            if (err?.name === 'AbortError' || seq !== requestSeq) return
            searchError.value = err?.rateLimited
                ? localize('mileageLog.form.address.rateLimited', 'Address search is temporarily rate-limited. Please try again in a moment.')
                : localize('mileageLog.form.address.searchFailed', 'Address search is unavailable right now. Try again, or pick on the map.')
            suggestions.value = []
        } finally {
            if (seq === requestSeq) isSearching.value = false
        }
    }

    /**
     * Runs the full provider chain once, immediately (modulo the Nominatim
     * politeness wait). Use for "search now" cases — the in-map search box,
     * or a single one-off geocode() lookup — where debouncing isn't wanted.
     * For keystroke-driven autocomplete, use searchDebounced() instead.
     */
    async function search(query: string, opts: AddressSearchOptions = {}): Promise<AddressSuggestion[]> {
        const seq = ++requestSeq
        const trimmed = query.trim()
        if (!trimmed) {
            suggestions.value = []
            return []
        }

        abortController?.abort()
        abortController = new AbortController()
        const signal = opts.signal ?? abortController.signal
        const limit = opts.limit ?? 8

        isSearching.value = true
        searchError.value = null

        try {
            const danish = await searchAdressevaelger(trimmed, { limit, signal })
            if (seq !== requestSeq) return suggestions.value

            if (danish.length > 0) {
                suggestions.value = danish
                activeProvider.value = 'adressevaelger'
                isSearching.value = false
                return danish
            }

            if (trimmed.length < 5) {
                suggestions.value = []
                isSearching.value = false
                return []
            }

            lastNominatimAt = Date.now()
            const fallback = await searchNominatim(trimmed, { limit, signal }, browserLocale())
            if (seq !== requestSeq) return suggestions.value

            suggestions.value = fallback
            activeProvider.value = fallback.length > 0 ? 'nominatim' : null
            return fallback
        } catch (err: any) {
            if (err?.name === 'AbortError') return suggestions.value
            if (seq !== requestSeq) return suggestions.value

            searchError.value = err?.rateLimited
                ? localize('mileageLog.form.address.rateLimited', 'Address search is temporarily rate-limited. Please try again in a moment.')
                : localize('mileageLog.form.address.searchFailed', 'Address search is unavailable right now. Try again, or pick on the map.')
            suggestions.value = []
            return []
        } finally {
            if (seq === requestSeq) isSearching.value = false
        }
    }

    /**
     * Debounced entry point for keystroke-driven search:
     *  1. 150ms after the last keystroke, query Adressevælgeren (no rate
     *     limit — safe per-keystroke).
     *  2. Only if that comes back empty, wait a further ~550ms (~700ms total)
     *     before trying Nominatim, and only once the query is >= 5 chars —
     *     Nominatim's usage policy forbids live per-keystroke querying, so
     *     the fallback tier stays slow and infrequent by construction.
     *  3. A stale response (superseded by a later keystroke) is dropped via
     *     the requestSeq guard, independent of AbortController.
     */
    function searchDebounced(query: string, opts: AddressSearchOptions = {}) {
        clearTimers()
        abortController?.abort()

        const trimmed = query.trim()
        if (trimmed.length < 2) {
            suggestions.value = []
            searchError.value = null
            return
        }

        const seq = ++requestSeq
        isSearching.value = true
        searchError.value = null

        danishTimer = setTimeout(async () => {
            if (seq !== requestSeq) return
            abortController?.abort()
            abortController = new AbortController()
            const signal = opts.signal ?? abortController.signal
            const limit = opts.limit ?? 8

            try {
                const danish = await searchAdressevaelger(trimmed, { limit, signal })
                if (seq !== requestSeq) return

                if (danish.length > 0) {
                    suggestions.value = danish
                    activeProvider.value = 'adressevaelger'
                    isSearching.value = false
                    return
                }

                suggestions.value = []
                if (trimmed.length < 5) {
                    isSearching.value = false
                    return
                }

                nominatimTimer = setTimeout(() => {
                    runNominatimFallback(trimmed, seq, { limit, signal })
                }, 550)
            } catch (err: any) {
                if (err?.name === 'AbortError' || seq !== requestSeq) return
                searchError.value = err?.rateLimited
                    ? localize('mileageLog.form.address.rateLimited', 'Address search is temporarily rate-limited. Please try again in a moment.')
                    : localize('mileageLog.form.address.searchFailed', 'Address search is unavailable right now. Try again, or pick on the map.')
                suggestions.value = []
                isSearching.value = false
            }
        }, 150)
    }

    async function resolveSuggestion(suggestion: AddressSuggestion): Promise<ResolvedAddressSuggestion | null> {
        if (suggestion.lat !== null && suggestion.lng !== null) {
            return suggestion as ResolvedAddressSuggestion
        }
        if (suggestion.provider === 'adressevaelger') {
            return resolveAdressevaelger(suggestion)
        }
        return null
    }

    return {
        suggestions,
        isSearching,
        activeProvider,
        searchError,
        search,
        searchDebounced,
        resolveSuggestion,
        clear,
        cancel,
    }
}

export default useAddressSearch
