/**
 * Pure helpers for superadmin "I dag" (pages/superadmin/today).
 *
 * Kept free of Nuxt auto-imports so they can be unit tested with `node --test`
 * (see tests/unit/superadminToday.test.mjs).
 *
 * The API (`GET /superadmin/today`) decides which sections a colleague may
 * see; these helpers only decide how what came back is shown.
 */

export type TodaySectionKey =
    | 'meetings_today'
    | 'missed_demos'
    | 'payment_problems'
    | 'license_orders'
    | 'agreements'
    | 'sales_inquiries'
    | 'overdue_invoices'

export type TodayDateKind = 'closes' | 'ordered' | 'ends' | 'received' | 'due' | 'starts' | 'demo'

export type TodayRow = {
    id: string
    company: { uuid: string, name: string } | null
    title: string | null
    amount: number | null
    date: string | null
    date_kind: TodayDateKind
    reason: string
    meta: Record<string, any>
}

export type TodaySection = {
    key: TodaySectionKey
    count: number
    amount: number | null
    rows: TodayRow[]
}

export type TodayKpis = {
    open_items: number
    outstanding_amount: number | null
    orders_awaiting_economic: number | null
    new_inquiries: number | null
}

export type TodayOverview = {
    date: string
    kpis: TodayKpis
    sections: TodaySection[]
}

export type Tone = 'danger' | 'warning' | 'neutral'

export const SECTION_ORDER: TodaySectionKey[] = [
    'meetings_today',
    'missed_demos',
    'payment_problems',
    'license_orders',
    'agreements',
    'sales_inquiries',
    'overdue_invoices',
]

export const SECTION_ICONS: Record<TodaySectionKey, string> = {
    meetings_today: 'ph:video-camera',
    missed_demos: 'ph:phone-call',
    payment_problems: 'ph:credit-card',
    license_orders: 'ph:receipt',
    agreements: 'ph:handshake',
    sales_inquiries: 'ph:tray',
    overdue_invoices: 'ph:file-text',
}

/** The page "Se alle" opens for a section. */
export const SECTION_HREFS: Record<TodaySectionKey, string> = {
    meetings_today: '/superadmin/meetings',
    missed_demos: '/superadmin/sales-inquiries',
    payment_problems: '/superadmin/billing-problems',
    license_orders: '/superadmin/orders',
    agreements: '/superadmin/companies',
    sales_inquiries: '/superadmin/sales-inquiries',
    overdue_invoices: '/superadmin/billing-problems',
}

const EMPTY_KPIS: TodayKpis = {
    open_items: 0,
    outstanding_amount: null,
    orders_awaiting_economic: null,
    new_inquiries: null,
}

function num(value: unknown): number {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
}

function numOrNull(value: unknown): number | null {
    return value === null || value === undefined ? null : num(value)
}

/** The API payload made safe to render: known sections only, in a fixed order. */
export function normalizeToday(payload: any): TodayOverview {
    const data = payload?.data ?? payload ?? {}
    const sections: TodaySection[] = (Array.isArray(data.sections) ? data.sections : [])
        .filter((s: any) => SECTION_ORDER.includes(s?.key))
        .map((s: any) => ({
            key: s.key,
            count: num(s.count),
            amount: numOrNull(s.amount),
            rows: (Array.isArray(s.rows) ? s.rows : []).map((r: any) => ({
                id: String(r?.id ?? ''),
                company: r?.company?.uuid ? { uuid: String(r.company.uuid), name: String(r.company.name ?? '') } : null,
                title: r?.title ?? null,
                amount: numOrNull(r?.amount),
                date: r?.date ?? null,
                date_kind: r?.date_kind ?? 'due',
                reason: String(r?.reason ?? ''),
                meta: r?.meta && typeof r.meta === 'object' ? r.meta : {},
            })),
        }))
        .sort((a: TodaySection, b: TodaySection) => SECTION_ORDER.indexOf(a.key) - SECTION_ORDER.indexOf(b.key))

    const kpis = data.kpis ?? {}

    return {
        date: String(data.date ?? ''),
        kpis: {
            open_items: num(kpis.open_items ?? EMPTY_KPIS.open_items),
            outstanding_amount: numOrNull(kpis.outstanding_amount),
            orders_awaiting_economic: numOrNull(kpis.orders_awaiting_economic),
            new_inquiries: numOrNull(kpis.new_inquiries),
        },
        sections,
    }
}

/** Sections with something to do, and the calm ones that collapse into "Alt er i orden". */
export function splitSections(sections: TodaySection[]): { open: TodaySection[], calm: TodaySection[] } {
    return {
        open: sections.filter((s) => s.count > 0),
        calm: sections.filter((s) => s.count <= 0),
    }
}

/** Nothing to do anywhere the colleague may look. */
export function allClear(sections: TodaySection[]): boolean {
    return sections.every((s) => s.count <= 0)
}

/** How many rows a section has beyond the ones shown. */
export function hiddenCount(section: TodaySection): number {
    return Math.max(0, section.count - section.rows.length)
}

/** Where the button on a row goes: straight to the task. */
export function rowHref(key: TodaySectionKey, row: TodayRow): string {
    const company = row.company?.uuid
    switch (key) {
        case 'agreements':
            return company ? `/superadmin/companies/${company}/agreements` : SECTION_HREFS.agreements
        case 'overdue_invoices':
            return company ? `/superadmin/companies/${company}/invoices` : SECTION_HREFS.overdue_invoices
        case 'sales_inquiries':
        case 'missed_demos':
            return row.id ? `/superadmin/sales-inquiries?inquiry=${encodeURIComponent(row.id)}` : SECTION_HREFS[key]
        case 'meetings_today':
            // Held from the panel; only a path inside it is followed.
            return typeof row.meta?.path === 'string' && row.meta.path.startsWith('/superadmin/meetings/') ? row.meta.path : SECTION_HREFS.meetings_today
        default:
            return SECTION_HREFS[key]
    }
}

/**
 * Red only for what is really wrong: last reminder sent, ready to close, or an
 * e-conomic error. The rest is something to do, not an alarm.
 */
export function reasonTone(reason: string): Tone {
    if (['reminder_3', 'ready_to_close', 'economic_error', 'demo_missed', 'demo_not_held'].includes(reason)) {
        return 'danger'
    }
    if (/^reminder_[12]$/.test(reason) || ['overdue', 'payment_failed', 'renewal_plan_missing', 'no_auto_renew', 'economic_pending', 'economic_draft', 'economic_finance'].includes(reason)) {
        return 'warning'
    }
    return 'neutral'
}

/**
 * Badge classes for a tone, next to `co-badge`. Only classes that already
 * exist in the build: co-badge-* (assets/css/superadmin.css) and amber, which
 * the pages use; composables/ is not in Tailwind's content list.
 */
export function toneBadgeClass(tone: Tone): string {
    return tone === 'danger' ? 'co-badge-red' : tone === 'warning' ? 'bg-warning-soft text-warning-ink' : 'co-badge-gray'
}

export function reasonKey(reason: string): string {
    return `superadmin.today.reason.${reason || 'unknown'}`
}

export function dateLabelKey(kind: TodayDateKind): string {
    return `superadmin.today.date.${kind}`
}

export function sectionKey(key: TodaySectionKey, part: 'title' | 'empty' | 'action' | 'hint'): string {
    return `superadmin.today.section.${key}.${part}`
}

/** Morning, afternoon or evening, by the hour on the colleague's clock. */
export function greetingKey(now: Date): string {
    const hour = now.getHours()
    if (hour < 10) return 'superadmin.today.greeting.morning'
    if (hour < 17) return 'superadmin.today.greeting.day'
    return 'superadmin.today.greeting.evening'
}

/** "12.345 kr." - whole kroner, Danish grouping. */
export function formatKroner(amount: number | null | undefined): string {
    if (amount === null || amount === undefined || !Number.isFinite(Number(amount))) {
        return '—'
    }
    const rounded = Math.round(Number(amount))
    const sign = rounded < 0 ? '-' : ''
    const grouped = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `${sign}${grouped} kr.`
}

/** "2026-11-08" -> "08.11.2026". */
export function todayDate(iso: string | null | undefined): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso ?? ''))
    return match ? `${match[3]}.${match[2]}.${match[1]}` : ''
}

export type KpiChip = {
    key: 'open_items' | 'outstanding_amount' | 'orders_awaiting_economic' | 'new_inquiries'
    value: string
    raw: number
    href: string | null
    icon: string
}

/** The small figures at the top; a figure the colleague may not see is left out. */
export function kpiChips(kpis: TodayKpis): KpiChip[] {
    const chips: KpiChip[] = [
        { key: 'open_items', value: String(kpis.open_items), raw: kpis.open_items, href: null, icon: 'ph:list-checks' },
    ]
    if (kpis.outstanding_amount !== null) {
        chips.push({ key: 'outstanding_amount', value: formatKroner(kpis.outstanding_amount), raw: kpis.outstanding_amount, href: SECTION_HREFS.payment_problems, icon: 'ph:coins' })
    }
    if (kpis.orders_awaiting_economic !== null) {
        chips.push({ key: 'orders_awaiting_economic', value: String(kpis.orders_awaiting_economic), raw: kpis.orders_awaiting_economic, href: SECTION_HREFS.license_orders, icon: 'ph:receipt' })
    }
    if (kpis.new_inquiries !== null) {
        chips.push({ key: 'new_inquiries', value: String(kpis.new_inquiries), raw: kpis.new_inquiries, href: SECTION_HREFS.sales_inquiries, icon: 'ph:tray' })
    }
    return chips
}
