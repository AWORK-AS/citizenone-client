/**
 * The pure parts of the superadmin data table (components/modules/superadmin/
 * data-table): where a response keeps its paging, which page numbers to draw,
 * and the same search/sort/paging done in the browser for the lists the API
 * sends whole.
 */

export interface PageMeta {
    page: number
    lastPage: number
    from: number
    to: number
    total: number
}

const toInt = (value: unknown, fallback = 0) => {
    const number = Number(value)
    return Number.isFinite(number) ? Math.floor(number) : fallback
}

/**
 * A Laravel resource collection keeps its paging in `meta`, a bare paginator
 * at the top level. `null` when the response has no paging at all.
 */
export function normalizePageMeta(response: any): PageMeta | null {
    const source = response?.meta && typeof response.meta === 'object' && 'current_page' in response.meta
        ? response.meta
        : response && typeof response === 'object' && 'current_page' in response
            ? response
            : null
    if (!source) return null

    const page = Math.max(1, toInt(source.current_page, 1))
    const lastPage = Math.max(1, toInt(source.last_page, page))
    const total = Math.max(0, toInt(source.total, 0))
    const from = total ? Math.max(0, toInt(source.from, 0)) : 0
    const to = total ? Math.max(from, toInt(source.to, from)) : 0
    return { page, lastPage, from, to, total }
}

/** The rows of a list response, whichever way it is wrapped. */
export function responseRows(response: any): any[] {
    if (Array.isArray(response)) return response
    if (Array.isArray(response?.data)) return response.data
    if (Array.isArray(response?.data?.data)) return response.data.data
    return []
}

/** First, last, and a window around the current page. `null` is a gap ("…"). */
export function pageWindow(current: number, last: number): (number | null)[] {
    if (last <= 1) return [1]
    if (last <= 7) return Array.from({ length: last }, (_, index) => index + 1)

    const window = new Set<number>([1, last, current, current - 1, current + 1])
    if (current <= 3) [2, 3, 4].forEach(page => window.add(page))
    if (current >= last - 2) [last - 3, last - 2, last - 1].forEach(page => window.add(page))

    const sorted = [...window].filter(page => page >= 1 && page <= last).sort((a, b) => a - b)
    return sorted.flatMap((page, index) => (index > 0 && page - sorted[index - 1] > 1 ? [null, page] : [page]))
}

export interface ClientListOptions {
    search?: string
    /** The text a row is searched in. */
    searchText?: (row: any) => string
    sort?: string | null
    order?: 'asc' | 'desc' | null
    /** The value a row sorts by, per column. Defaults to `row[sort]`. */
    sortValue?: (row: any, sort: string) => unknown
    page?: number
    perPage?: number
}

export function normalizeSearchTerm(value: unknown): string {
    return String(value ?? '')
        .toLocaleLowerCase('da')
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .trim()
}

function compareValues(a: unknown, b: unknown): number {
    const emptyA = a === null || a === undefined || a === ''
    const emptyB = b === null || b === undefined || b === ''
    if (emptyA || emptyB) return emptyA === emptyB ? 0 : emptyA ? 1 : -1
    if (typeof a === 'number' && typeof b === 'number') return a - b
    const numberA = Number(a)
    const numberB = Number(b)
    if (typeof a !== 'boolean' && Number.isFinite(numberA) && Number.isFinite(numberB) && String(a).trim() !== '' && String(b).trim() !== '') {
        return numberA - numberB
    }
    return String(a).localeCompare(String(b), 'da', { numeric: true, sensitivity: 'base' })
}

/** Search (every word must match), sort, then the page of it. Empty values sort last either way. */
export function filterAndSortRows(rows: any[], options: ClientListOptions = {}): any[] {
    const words = normalizeSearchTerm(options.search).split(/\s+/).filter(Boolean)
    const searchText = options.searchText ?? ((row: any) => Object.values(row ?? {}).filter(v => typeof v !== 'object').join(' '))

    let out = words.length
        ? rows.filter((row) => {
            const text = normalizeSearchTerm(searchText(row))
            return words.every(word => text.includes(word))
        })
        : [...rows]

    if (options.sort) {
        const sort = options.sort
        const read = options.sortValue ?? ((row: any) => row?.[sort])
        const direction = options.order === 'desc' ? -1 : 1
        out = out
            .map((row, index) => ({ row, index, value: read(row, sort) }))
            .sort((a, b) => {
                const emptyA = a.value === null || a.value === undefined || a.value === ''
                const emptyB = b.value === null || b.value === undefined || b.value === ''
                if (emptyA !== emptyB) return emptyA ? 1 : -1
                return compareValues(a.value, b.value) * direction || a.index - b.index
            })
            .map(entry => entry.row)
    }

    return out
}

export function clientPage(rows: any[], options: ClientListOptions = {}): { rows: any[]; all: any[]; meta: PageMeta } {
    const all = filterAndSortRows(rows, options)
    const perPage = Math.max(1, options.perPage ?? 25)
    const lastPage = Math.max(1, Math.ceil(all.length / perPage))
    const page = Math.min(Math.max(1, options.page ?? 1), lastPage)
    const start = (page - 1) * perPage
    const pageRows = all.slice(start, start + perPage)
    return {
        rows: pageRows,
        all,
        meta: {
            page,
            lastPage,
            from: pageRows.length ? start + 1 : 0,
            to: start + pageRows.length,
            total: all.length,
        },
    }
}

/** A column of the superadmin data table. */
export interface DataTableColumn {
    key: string
    label?: string
    /** Sortable by the server (or in the browser); a string is the sort field when it is not `key`. */
    sortable?: boolean | string
    align?: 'left' | 'right' | 'center'
    /** Any CSS width, e.g. '120px'. */
    width?: string
    headerClass?: string
    cellClass?: string
    /** How the column goes into the CSV. `false` leaves it out; columns without a label never go in. */
    csv?: false | { label?: string; value?: (row: any) => unknown; type?: 'text' | 'number' | 'amount' | 'date' | 'datetime' }
}

export interface DataTableChip {
    key: string
    label: string
}

/** The sort field a column sorts by, or null when it does not sort. */
export function columnSortField(column: DataTableColumn): string | null {
    if (!column.sortable) return null
    return typeof column.sortable === 'string' ? column.sortable : column.key
}

/** The CSV columns a table's columns give: labelled, not opted out, value from `row[key]` unless told. */
export function csvColumnsFor(columns: DataTableColumn[]): { label: string; value: (row: any) => unknown; type?: 'text' | 'number' | 'amount' | 'date' | 'datetime' }[] {
    return columns
        .filter(column => column.csv !== false && (column.csv?.label || column.label))
        .map(column => {
            const csv = column.csv || {}
            return {
                label: (csv.label || column.label) as string,
                value: csv.value ?? ((row: any) => row?.[column.key]),
                type: csv.type,
            }
        })
}
