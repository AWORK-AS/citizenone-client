/**
 * The journal list's multi-select filters as request params. The API takes them as
 * JSON arrays; an empty selection sends nothing, so "no tags chosen" never narrows
 * the list to notes without tags.
 */
export function journalListFilterParams(tags: string[], createdBy: string[]): Record<string, string> {
    const params: Record<string, string> = {}
    if (tags.length) params.tags_uuid = JSON.stringify(tags)
    if (createdBy.length) params.created_by = JSON.stringify(createdBy)
    return params
}

export type JournalFilterState = {
    sortOrder: string
    lock?: boolean
    favorite?: boolean
    search: string
    dateRange?: unknown[]
    tags: string[]
    createdBy: string[]
}

/** Whether anything narrows or reorders the list, which is when Reset is offered. */
export function hasActiveJournalFilters(state: JournalFilterState): boolean {
    return state.sortOrder === 'ascend'
        || Boolean(state.lock)
        || Boolean(state.favorite)
        || state.search.trim() !== ''
        || Boolean(state.dateRange?.length)
        || state.tags.length > 0
        || state.createdBy.length > 0
}
