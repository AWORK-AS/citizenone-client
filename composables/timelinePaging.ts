/**
 * Paging for the citizen timeline. The backend returns the timeline newest
 * first, one page at a time (`page`, `per_page`), with `meta.has_more` saying
 * whether anything older exists. It used to return at most 200 entries with no
 * way to reach older ones.
 *
 * Pages are fetched by position, so an entry added between two requests pushes
 * everything down one place and the next page can repeat the last entry of the
 * previous one. Merging by `source` + `uuid` keeps each entry once.
 */

export const TIMELINE_PAGE_SIZE = 50

export interface TimelineEntry {
    source: string
    uuid: string
    date: string
    [key: string]: unknown
}

export interface TimelineMeta {
    current_page?: number
    per_page?: number
    has_more?: boolean
}

export function timelineEntryKey(entry: TimelineEntry): string {
    return `${entry.source}:${entry.uuid}`
}

/**
 * The entries already shown followed by the new page's entries, without
 * repeats, newest first. Entries already shown keep their place.
 */
export function mergeTimelinePage(existing: TimelineEntry[], incoming: TimelineEntry[]): TimelineEntry[] {
    const seen = new Set(existing.map(timelineEntryKey))
    const merged = [...existing]

    for (const entry of incoming ?? []) {
        const key = timelineEntryKey(entry)
        if (!seen.has(key)) {
            seen.add(key)
            merged.push(entry)
        }
    }

    // Stable sort: equal dates keep the order the server gave them.
    return merged
        .map((entry, index) => ({ entry, index, time: Date.parse(entry.date) }))
        .sort((a, b) => (b.time - a.time) || (a.index - b.index))
        .map(({ entry }) => entry)
}

/**
 * Whether older entries can be fetched. A response without `meta` comes from a
 * backend that cannot page, which returned everything it had.
 */
export function timelineHasMore(meta: TimelineMeta | undefined | null): boolean {
    return meta?.has_more === true
}
