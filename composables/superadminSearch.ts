/**
 * Pure helpers behind the superadmin search palette (⌘K / Ctrl+K).
 *
 * Kept free of Nuxt auto-imports so they can be unit tested with `node --test`
 * (see tests/unit/superadminSearch.test.mjs). The component owns the timers,
 * the request and localStorage; everything that decides *what* is shown and
 * in which order lives here.
 *
 * Nothing here is access control. Which groups the API returns is decided per
 * permission on the server, and the menu pages offered come from the already
 * filtered `useSuperadminNav().visible`.
 */

export type SearchGroup = 'recent' | 'pages' | 'companies' | 'accounts' | 'team' | 'invoices' | 'agreements'

export type PaletteItem = {
    /** Unique across groups: `${group}:${uuid or href}`. */
    id: string
    group: Exclude<SearchGroup, 'recent'>
    title: string
    /** Data shown under the title (numbers, e-mail, company). Not translated. */
    subtitle?: string | null
    href: string
    icon: string
    /** Suffixes of `superadmin.search.badge.*`. */
    badges?: string[]
}

export type PaletteSection = { key: SearchGroup; items: PaletteItem[] }

/** The shape of `GET /superadmin/search` -> `data.groups`. Every key is optional. */
export type SearchApiGroups = {
    companies?: Array<{ uuid: string; name: string; cvr?: string | null; economic_customer_number?: number | null; status?: 'active' | 'closed'; billing_method?: 'card' | 'invoice' | null }>
    accounts?: Array<{ uuid: string; name: string; email?: string | null; is_active?: boolean; is_archived?: boolean; company_uuid: string; company_name?: string | null }>
    team?: Array<{ uuid: string; name: string; email?: string | null; is_active?: boolean; role?: string | null }>
    invoices?: Array<{ uuid: string; invoice_number?: string | null; economic_invoice_number?: number | null; economic_draft_number?: number | null; status?: string | null; is_paid?: boolean; company_uuid?: string | null; company_name?: string | null }>
    agreements?: Array<{ uuid: string; name: string; status?: string | null; company_uuid: string; company_name?: string | null }>
}

/** Order the API groups are shown in. Menu pages go first: they are instant and few. */
export const SEARCH_API_GROUP_ORDER = ['companies', 'accounts', 'invoices', 'agreements', 'team'] as const

export const SEARCH_MIN_QUERY = 2
export const SEARCH_DEBOUNCE_MS = 200
export const SEARCH_RECENT_MAX = 5
export const SEARCH_RECENT_STORAGE_KEY = 'superadmin.search.recent'
export const SEARCH_PAGE_LIMIT = 5

export const SEARCH_GROUP_ICONS: Record<SearchGroup, string> = {
    recent: 'ph:clock-counter-clockwise',
    pages: 'ph:squares-four',
    companies: 'ph:buildings',
    accounts: 'ph:user',
    team: 'ph:identification-badge',
    invoices: 'ph:invoice',
    agreements: 'ph:handshake',
}

/* ---------------------------------------------------------------- text */

/**
 * Lower case without accents, so "Ø" still finds "ø" and "e" finds "é".
 * "å" is a letter of its own in Danish, Norwegian and Swedish, not an accented
 * "a", so it is kept (as are "ä" and "ö").
 */
export function normalizeSearchText(text: string | null | undefined): string {
    return (text ?? '')
        .toString()
        .toLowerCase()
        .replace(/[^\u0000-\u007f]/g, (char) => (
            'åäö'.includes(char) ? char : char.normalize('NFD').replace(/[̀-ͯ]/g, '')
        ))
        .trim()
}

export type HighlightPart = { text: string; match: boolean }

/**
 * The text split around the first case-insensitive occurrence of the query,
 * so the template can bold it without `v-html`.
 */
export function highlightMatch(text: string | null | undefined, query: string): HighlightPart[] {
    const value = (text ?? '').toString()
    const needle = query.trim()
    if (!value) return []
    if (!needle) return [{ text: value, match: false }]

    const index = value.toLocaleLowerCase().indexOf(needle.toLocaleLowerCase())
    if (index === -1) return [{ text: value, match: false }]

    return [
        { text: value.slice(0, index), match: false },
        { text: value.slice(index, index + needle.length), match: true },
        { text: value.slice(index + needle.length), match: false },
    ].filter((part) => part.text !== '')
}

/* ----------------------------------------------------------- menu pages */

type NavItemLike = { name: string; label: string; href: string; icon: string; tabs?: NavItemLike[] }

export type NavPageEntry = {
    href: string
    icon: string
    title: string
    /** Hub the tab sits under, translated - shown as subtitle. */
    parent?: string | null
    /** Extra words that should find the page: the English name, the hub. */
    keywords: string[]
}

/**
 * Every page in the already permission-filtered menu, tabs included, with its
 * label translated. A hub is represented by its tabs, which is where it leads.
 */
export function navPageEntries(groups: Record<string, NavItemLike[]>, t: (key: string) => string): NavPageEntry[] {
    const seen = new Set<string>()
    const entries: NavPageEntry[] = []

    const add = (item: NavItemLike, parent: NavItemLike | null) => {
        if (seen.has(item.href)) return
        seen.add(item.href)
        const parentTitle = parent ? t(parent.label) : null
        entries.push({
            href: item.href,
            icon: item.icon,
            title: t(item.label),
            parent: parentTitle,
            keywords: [item.name, parent?.name, parentTitle].filter((word): word is string => !!word),
        })
    }

    for (const items of Object.values(groups)) {
        for (const item of items) {
            if (item.tabs?.length) item.tabs.forEach((tab) => add(tab, item))
            else add(item, null)
        }
    }

    return entries
}

/**
 * How well a page matches, lower is better; null for no match.
 * 0 exact title, 1 title prefix, 2 a word in the title starts with it,
 * 3 title contains it, 4 a keyword starts with or contains it.
 */
export function scoreNavPage(entry: NavPageEntry, query: string): number | null {
    const q = normalizeSearchText(query)
    if (!q) return null

    const title = normalizeSearchText(entry.title)
    if (title === q) return 0
    if (title.startsWith(q)) return 1
    if (title.split(/[\s\-/&()]+/).some((word) => word.startsWith(q))) return 2
    if (title.includes(q)) return 3
    if (entry.keywords.some((word) => normalizeSearchText(word).includes(q))) return 4

    return null
}

export function matchNavPages(entries: NavPageEntry[], query: string, limit = SEARCH_PAGE_LIMIT): PaletteItem[] {
    return entries
        .map((entry, index) => ({ entry, index, score: scoreNavPage(entry, query) }))
        .filter((row): row is { entry: NavPageEntry; index: number; score: number } => row.score !== null)
        .sort((a, b) => a.score - b.score || a.index - b.index)
        .slice(0, limit)
        .map(({ entry }) => ({
            id: `pages:${entry.href}`,
            group: 'pages' as const,
            title: entry.title,
            subtitle: entry.parent ?? null,
            href: entry.href,
            icon: entry.icon,
        }))
}

/* ----------------------------------------------------------- API results */

const joined = (...parts: Array<string | null | undefined | false>) => parts.filter(Boolean).join(' · ') || null

/** Where each kind of hit opens. */
export function searchHrefFor(group: Exclude<SearchGroup, 'recent' | 'pages'>, row: { uuid: string; company_uuid?: string | null }): string {
    switch (group) {
        case 'companies':
            return `/superadmin/companies/${row.uuid}/overview`
        case 'accounts':
            return `/superadmin/companies/${row.company_uuid}/accounts/${row.uuid}/edit`
        case 'team':
            return `/superadmin/users/edit/${row.uuid}`
        case 'invoices':
            return `/superadmin/invoices/${row.uuid}/invoice-details`
        case 'agreements':
            return `/superadmin/companies/${row.company_uuid}/agreements`
    }
}

/** The API's grouped answer as palette rows, per group, in `SEARCH_API_GROUP_ORDER`. */
export function searchApiSections(groups: SearchApiGroups | null | undefined): PaletteSection[] {
    if (!groups) return []

    const build: { [K in (typeof SEARCH_API_GROUP_ORDER)[number]]: (row: any) => PaletteItem } = {
        companies: (row) => ({
            id: `companies:${row.uuid}`,
            group: 'companies',
            title: row.name,
            subtitle: joined(row.cvr && `CVR ${row.cvr}`, row.economic_customer_number != null && `e-conomic ${row.economic_customer_number}`),
            href: searchHrefFor('companies', row),
            icon: SEARCH_GROUP_ICONS.companies,
            badges: [
                row.status === 'closed' ? 'closed' : null,
                row.billing_method === 'invoice' ? 'billingInvoice' : row.billing_method === 'card' ? 'billingCard' : null,
            ].filter((badge): badge is string => !!badge),
        }),
        accounts: (row) => ({
            id: `accounts:${row.uuid}`,
            group: 'accounts',
            title: row.name || row.email,
            subtitle: joined(row.name ? row.email : null, row.company_name),
            href: searchHrefFor('accounts', row),
            icon: SEARCH_GROUP_ICONS.accounts,
            badges: row.is_archived ? ['archived'] : row.is_active === false ? ['inactive'] : [],
        }),
        invoices: (row) => ({
            id: `invoices:${row.uuid}`,
            group: 'invoices',
            title: row.invoice_number ? `#${row.invoice_number}` : row.uuid,
            subtitle: joined(
                row.company_name,
                row.economic_invoice_number != null
                    ? `e-conomic ${row.economic_invoice_number}`
                    : row.economic_draft_number != null && `e-conomic ${row.economic_draft_number}`,
            ),
            href: searchHrefFor('invoices', row),
            icon: SEARCH_GROUP_ICONS.invoices,
            badges: [
                row.is_paid || row.status === 'paid' ? 'paid' : row.status === 'failed' ? 'failed' : 'unpaid',
                row.economic_invoice_number == null && row.economic_draft_number != null ? 'economicDraft' : null,
            ].filter((badge): badge is string => !!badge),
        }),
        agreements: (row) => ({
            id: `agreements:${row.uuid}`,
            group: 'agreements',
            title: row.name,
            subtitle: row.company_name ?? null,
            href: searchHrefFor('agreements', row),
            icon: SEARCH_GROUP_ICONS.agreements,
            badges: row.status && row.status !== 'active' ? [`agreement_${row.status}`] : [],
        }),
        team: (row) => ({
            id: `team:${row.uuid}`,
            group: 'team',
            title: row.name || row.email,
            subtitle: joined(row.name ? row.email : null, row.role),
            href: searchHrefFor('team', row),
            icon: SEARCH_GROUP_ICONS.team,
            badges: row.is_active === false ? ['inactive'] : [],
        }),
    }

    return SEARCH_API_GROUP_ORDER.flatMap((key) => {
        const rows = groups[key]
        if (!Array.isArray(rows) || rows.length === 0) return []
        return [{ key, items: rows.map(build[key]) }]
    })
}

/**
 * Everything the palette shows for a query, in order.
 * No query: the recent picks. A query: matching menu pages, then the API groups.
 */
export function buildPaletteSections(query: string, pages: PaletteItem[], api: PaletteSection[], recent: PaletteItem[]): PaletteSection[] {
    if (!query.trim()) {
        return recent.length ? [{ key: 'recent', items: recent }] : []
    }

    const sections: PaletteSection[] = []
    if (pages.length) sections.push({ key: 'pages', items: pages })

    return [...sections, ...api]
}

/** The sections as one list, for keyboard navigation and `aria-activedescendant`. */
export function flattenPaletteSections(sections: PaletteSection[]): PaletteItem[] {
    return sections.flatMap((section) => section.items)
}

/* ------------------------------------------------------------- keyboard */

/** The next active row for ↑ (-1) / ↓ (+1), wrapping at both ends. -1 when empty. */
export function movePaletteIndex(current: number, delta: number, length: number): number {
    if (length <= 0) return -1
    if (current < 0 || current >= length) return delta < 0 ? length - 1 : 0

    return (((current + delta) % length) + length) % length
}

export type PaletteKeyAction = 'next' | 'prev' | 'first' | 'last' | 'select' | 'close' | null

export function paletteKeyAction(event: { key: string; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean }): PaletteKeyAction {
    switch (event.key) {
        case 'ArrowDown':
            return 'next'
        case 'ArrowUp':
            return 'prev'
        case 'Home':
            return event.ctrlKey || event.metaKey ? 'first' : null
        case 'End':
            return event.ctrlKey || event.metaKey ? 'last' : null
        case 'Enter':
            return 'select'
        case 'Escape':
            return 'close'
        // Emacs-style, the way most palettes allow it.
        case 'n':
            return event.ctrlKey && !event.metaKey ? 'next' : null
        case 'p':
            return event.ctrlKey && !event.metaKey ? 'prev' : null
        default:
            return null
    }
}

/** ⌘K on a Mac, Ctrl+K everywhere else. */
export function isPaletteShortcut(event: { key: string; metaKey?: boolean; ctrlKey?: boolean; altKey?: boolean; shiftKey?: boolean }): boolean {
    return (event.key === 'k' || event.key === 'K') && !!(event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey
}

export function isMacPlatform(platform: string | null | undefined): boolean {
    return /mac|iphone|ipad|ipod/i.test(platform ?? '')
}

export function paletteShortcutLabel(platform: string | null | undefined): string {
    return isMacPlatform(platform) ? '⌘K' : 'Ctrl K'
}

/* --------------------------------------------------------------- recent */

const RECENT_FIELDS = ['id', 'group', 'title', 'href', 'icon'] as const

function isPaletteItem(value: any): value is PaletteItem {
    return !!value && typeof value === 'object' && RECENT_FIELDS.every((field) => typeof value[field] === 'string' && value[field] !== '')
        && value.href.startsWith('/superadmin')
}

/** Most recent first, no duplicates, at most `max`. */
export function addRecentPick(list: PaletteItem[], item: PaletteItem, max = SEARCH_RECENT_MAX): PaletteItem[] {
    const entry: PaletteItem = {
        id: item.id,
        group: item.group,
        title: item.title,
        subtitle: item.subtitle ?? null,
        href: item.href,
        icon: item.icon,
        badges: item.badges ?? [],
    }

    return [entry, ...list.filter((existing) => existing.id !== item.id)].slice(0, max)
}

/** What was stored, or an empty list for anything that does not look right. */
export function parseRecentPicks(raw: string | null | undefined, max = SEARCH_RECENT_MAX): PaletteItem[] {
    if (!raw) return []
    try {
        const value = JSON.parse(raw)
        return Array.isArray(value) ? value.filter(isPaletteItem).slice(0, max) : []
    } catch {
        return []
    }
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

/** Storage can be missing or throw (private mode, blocked cookies); never let that break the palette. */
export function readRecentPicks(storage: StorageLike | null | undefined, key = SEARCH_RECENT_STORAGE_KEY): PaletteItem[] {
    try {
        return parseRecentPicks(storage?.getItem(key))
    } catch {
        return []
    }
}

export function writeRecentPicks(storage: StorageLike | null | undefined, list: PaletteItem[], key = SEARCH_RECENT_STORAGE_KEY): boolean {
    try {
        if (!storage) return false
        storage.setItem(key, JSON.stringify(list.slice(0, SEARCH_RECENT_MAX)))
        return true
    } catch {
        return false
    }
}
