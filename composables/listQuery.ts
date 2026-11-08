/**
 * Superadmin lists keep what you are looking at in the address bar: the search,
 * the filters, the sort and the page. Back/forward and a pasted link then show
 * the same list. This is the pure half (route query in, state out, and back);
 * `useListQuery` wires it to the router.
 *
 * In the URL:
 *   q=acme            the search, as typed
 *   page=3            only when not 1
 *   sort=name         ascending, `sort=-name` descending; left out at the default
 *   status=paid       one key per filter, left out when empty or at its default
 *
 * Two lists on one page keep apart with a prefix (`lo_q`, `lo_page`, ...).
 */

export type ListSortOrder = 'asc' | 'desc'

export interface ListQueryState {
    search: string
    page: number
    sort: string | null
    order: ListSortOrder | null
    filters: Record<string, string>
}

export interface ListQueryOptions {
    /** Prefix for every key, for a second list on the same page. */
    prefix?: string
    /** The filters this list knows, with their default value ('' when none). */
    filters?: Record<string, string>
    /** The sort the list has with nothing in the URL. */
    defaultSort?: string | null
    defaultOrder?: ListSortOrder | null
}

type RouteQueryValue = string | null | undefined | (string | null)[]
export type RouteQuery = Record<string, RouteQueryValue>

const RESERVED = ['q', 'page', 'sort']

function first(value: RouteQueryValue): string {
    const raw = Array.isArray(value) ? value[0] : value
    return typeof raw === 'string' ? raw : ''
}

function key(options: ListQueryOptions, name: string): string {
    return `${options.prefix ?? ''}${name}`
}

/** The keys this list owns in the route query. Anything else is left alone. */
export function listQueryKeys(options: ListQueryOptions = {}): string[] {
    return [...RESERVED, ...Object.keys(options.filters ?? {})].map(name => key(options, name))
}

export function defaultListQuery(options: ListQueryOptions = {}): ListQueryState {
    return {
        search: '',
        page: 1,
        sort: options.defaultSort ?? null,
        order: options.defaultSort ? (options.defaultOrder ?? 'asc') : null,
        filters: { ...(options.filters ?? {}) },
    }
}

/** `name` / `-name` to field and order. Anything odd is no sort at all. */
export function parseSortParam(value: string): { sort: string | null; order: ListSortOrder | null } {
    const match = /^(-?)([A-Za-z0-9_.]+)$/.exec(value.trim())
    if (!match) return { sort: null, order: null }
    return { sort: match[2], order: match[1] ? 'desc' : 'asc' }
}

export function sortParam(sort: string | null, order: ListSortOrder | null): string {
    if (!sort) return ''
    return order === 'desc' ? `-${sort}` : sort
}

export function parseListQuery(query: RouteQuery = {}, options: ListQueryOptions = {}): ListQueryState {
    const state = defaultListQuery(options)

    state.search = first(query[key(options, 'q')])

    const page = Number.parseInt(first(query[key(options, 'page')]), 10)
    state.page = Number.isFinite(page) && page > 0 ? page : 1

    const sort = first(query[key(options, 'sort')])
    if (sort) {
        const parsed = parseSortParam(sort)
        if (parsed.sort) {
            state.sort = parsed.sort
            state.order = parsed.order
        }
    }

    for (const name of Object.keys(options.filters ?? {})) {
        const value = first(query[key(options, name)])
        if (value !== '') state.filters[name] = value
    }

    return state
}

/** Only what differs from the defaults, so a fresh list has a clean URL. */
export function serializeListQuery(state: ListQueryState, options: ListQueryOptions = {}): Record<string, string> {
    const out: Record<string, string> = {}
    const defaults = defaultListQuery(options)

    const search = (state.search ?? '').trim()
    if (search) out[key(options, 'q')] = search

    if (state.page > 1) out[key(options, 'page')] = String(Math.floor(state.page))

    const sort = sortParam(state.sort, state.order)
    if (sort !== sortParam(defaults.sort, defaults.order)) {
        // Back to "no sort" when the default had one: `sort=` would read as the default again.
        out[key(options, 'sort')] = sort || '-'
    }

    for (const [name, fallback] of Object.entries(options.filters ?? {})) {
        const value = state.filters?.[name] ?? ''
        if (value !== fallback && !(value === '' && fallback === '')) out[key(options, name)] = value
    }

    return out
}

/**
 * The next route query: this list's keys replaced, every other key (another
 * list's, or `?inquiry=` opening a detail) kept as it is.
 */
export function mergeListQuery(current: RouteQuery, state: ListQueryState, options: ListQueryOptions = {}): RouteQuery {
    const own = new Set(listQueryKeys(options))
    const next: RouteQuery = {}
    for (const [name, value] of Object.entries(current ?? {})) {
        if (!own.has(name)) next[name] = value
    }
    return { ...next, ...serializeListQuery(state, options) }
}

/** Whether two states ask the server for the same list. */
export function sameListQuery(a: ListQueryState, b: ListQueryState, options: ListQueryOptions = {}): boolean {
    const left = serializeListQuery(a, options)
    const right = serializeListQuery(b, options)
    const keys = new Set([...Object.keys(left), ...Object.keys(right)])
    for (const name of keys) {
        if (left[name] !== right[name]) return false
    }
    return true
}

/**
 * A click on a column header: a new column sorts ascending, the same column
 * flips to descending, and a third click goes back to the list's own default.
 */
export function nextSort(state: ListQueryState, field: string, options: ListQueryOptions = {}): Pick<ListQueryState, 'sort' | 'order'> {
    if (state.sort !== field) return { sort: field, order: 'asc' }
    if (state.order === 'asc') return { sort: field, order: 'desc' }
    const defaults = defaultListQuery(options)
    if (defaults.sort === field && defaults.order === 'desc') return { sort: field, order: 'asc' }
    return { sort: defaults.sort, order: defaults.order }
}

/** The superadmin API's own spelling: `sortField` plus `ascend` / `descend`. */
export function apiSortParams(state: Pick<ListQueryState, 'sort' | 'order'>): { sortField?: string; sortOrder?: 'ascend' | 'descend' } {
    if (!state.sort) return {}
    return { sortField: state.sort, sortOrder: state.order === 'desc' ? 'descend' : 'ascend' }
}

/**
 * The search the way the superadmin list endpoints have always received it: a
 * JSON array of the words (`search=["acme","aps"]`). The pages used to pass
 * `[words]` and let the query encoder JSON it; this is the same string on the
 * wire. Empty is `undefined`, so the key is left out.
 */
export function apiSearchParam(search: string): string | undefined {
    const trimmed = (search ?? '').trim()
    return trimmed ? JSON.stringify(trimmed.split(/\s+/)) : undefined
}

/** Whether anything narrows the list, which is when "clear filters" is worth offering. */
export function hasListFilters(state: ListQueryState, options: ListQueryOptions = {}): boolean {
    if ((state.search ?? '').trim()) return true
    return Object.entries(options.filters ?? {}).some(([name, fallback]) => (state.filters?.[name] ?? '') !== fallback)
}
