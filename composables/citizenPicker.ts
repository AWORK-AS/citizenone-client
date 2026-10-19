/**
 * Search-as-you-type logic for the citizen pickers (referral, mail link,
 * invoice). Pure and framework free so it can be unit tested: the Vue side
 * only supplies a fetch function and renders `options`.
 *
 * The citizen list endpoint filters on `name` (firstname OR lastname LIKE),
 * so a multi-word query is sent as its first word and narrowed to the other
 * words here.
 */

export interface CitizenOption {
    value: string
    label: string
}

export const FIRST_PAGE_SIZE = 50
export const SEARCH_DELAY_MS = 300

export function toCitizenOption(citizen: any): CitizenOption {
    return {
        value: citizen.uuid,
        label: `${citizen.firstname ?? ''} ${citizen.lastname ?? ''}`.trim(),
    }
}

/** The `name` value to send: the first word of what was typed. */
export function nameParam(query: string): string {
    return (query ?? '').trim().split(/\s+/)[0] ?? ''
}

/** Keeps only options whose label contains every typed word. */
export function matchesAllWords(options: CitizenOption[], query: string): CitizenOption[] {
    const words = (query ?? '').trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (words.length < 2) return options
    return options.filter((o) => words.every((w) => o.label.toLowerCase().includes(w)))
}

/** Puts the selected option first when the result page does not hold it. */
export function withSelected(
    options: CitizenOption[],
    selectedValue: string | null | undefined,
    known: Map<string, CitizenOption>,
): CitizenOption[] {
    if (!selectedValue || options.some((o) => o.value === selectedValue)) return options
    const selected = known.get(selectedValue)
    return selected ? [selected, ...options] : options
}

type Timer = ReturnType<typeof setTimeout>

export interface CitizenSearchDeps {
    fetchPage: (params: { page_length: number; name?: string }) => Promise<any[]>
    onOptions: (options: CitizenOption[]) => void
    onError?: (error: unknown) => void
    getSelected?: () => string | null | undefined
    delay?: number
    pageSize?: number
    setTimer?: (fn: () => void, ms: number) => Timer
    clearTimer?: (t: Timer) => void
}

export function createCitizenSearch(deps: CitizenSearchDeps) {
    const known = new Map<string, CitizenOption>()
    const delay = deps.delay ?? SEARCH_DELAY_MS
    const pageSize = deps.pageSize ?? FIRST_PAGE_SIZE
    const setT = deps.setTimer ?? setTimeout
    const clearT = deps.clearTimer ?? clearTimeout
    let timer: Timer | null = null
    let sequence = 0

    async function run(query: string) {
        const mine = ++sequence
        const name = nameParam(query)
        try {
            const rows = await deps.fetchPage(name ? { page_length: pageSize, name } : { page_length: pageSize })
            // A newer request started meanwhile: its answer wins.
            if (mine !== sequence) return
            const options = matchesAllWords((rows ?? []).map(toCitizenOption), query)
            options.forEach((o) => known.set(o.value, o))
            deps.onOptions(withSelected(options, deps.getSelected?.(), known))
        } catch (error) {
            if (mine === sequence) deps.onError?.(error)
        }
    }

    return {
        /** First page, immediately (on open). */
        load: () => run(''),
        /** Typing: debounced, empty text goes back to the first page. */
        search(query: string) {
            if (timer !== null) clearT(timer)
            timer = setT(() => {
                timer = null
                run(query)
            }, delay)
        },
        /** Remember an option the caller already knows (e.g. a prefilled citizen). */
        remember(option: CitizenOption) {
            known.set(option.value, option)
        },
        cancel() {
            if (timer !== null) clearT(timer)
            timer = null
            sequence++
        },
    }
}
