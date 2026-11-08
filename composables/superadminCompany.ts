/**
 * Pure helpers for the superadmin company header (status pill, billing label,
 * tabs) and the company history (types, icons, grouping by month, paging).
 *
 * Kept free of Nuxt auto-imports so they can be unit tested with `node --test`
 * (see tests/unit/superadminCompany.test.mjs). Nothing here is access control:
 * the API decides what a colleague may read; these only decide what is shown.
 */

export type CompanyStatus = 'active' | 'closed' | 'reminder' | 'collection' | 'written_off' | 'trial'

export type StatusTone = 'ok' | 'pending' | 'failure' | 'muted' | 'info'

export type CompanySummary = {
    uuid: string
    name: string
    is_active: boolean
    deactivated_at: string | null
    contract_ends_at: string | null
    status: CompanyStatus
    reminder_stage: number | null
    billing_method: 'card' | 'invoice'
    leverandorservice: boolean
    billed_from_economic: boolean
    economic_customer_number: number | null
    mrr: number | null
    mrr_captured_on: string | null
    agreement: {
        uuid: string
        name: string
        starts_on: string | null
        ends_on: string | null
        auto_renews: boolean
        contract_value: number
    } | null
    can_view_financials: boolean
}

export type StatusPill = { status: CompanyStatus; tone: StatusTone; labelKey: string; params: Record<string, number> }

const STATUS_TONES: Record<CompanyStatus, StatusTone> = {
    active: 'ok',
    trial: 'info',
    reminder: 'pending',
    collection: 'failure',
    written_off: 'muted',
    closed: 'muted',
}

/** Tailwind classes per tone: green ok, amber pending, red failure, grey closed. */
export const TONE_CLASSES: Record<StatusTone, { pill: string; dot: string }> = {
    ok: { pill: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
    pending: { pill: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
    failure: { pill: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500' },
    muted: { pill: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
    info: { pill: 'bg-primary-50 text-primary border-primary-100', dot: 'bg-primary' },
}

const KNOWN_STATUSES = Object.keys(STATUS_TONES) as CompanyStatus[]

export function companyStatusPill(summary: Pick<CompanySummary, 'status' | 'reminder_stage'> | null | undefined): StatusPill | null {
    if (!summary) return null

    const status: CompanyStatus = KNOWN_STATUSES.includes(summary.status) ? summary.status : 'active'
    const stage = Number(summary.reminder_stage) || 0

    return {
        status,
        tone: STATUS_TONES[status],
        labelKey: `superadmin.companyHeader.status.${status}`,
        params: status === 'reminder' ? { stage: Math.max(1, stage) } : {},
    }
}

export type BillingLabel = 'card' | 'invoice' | 'leverandorservice' | 'economic'

/** The same four words the history uses for a billing-method change. */
export function billingLabel(summary: Pick<CompanySummary, 'billing_method' | 'leverandorservice' | 'billed_from_economic'> | null | undefined): BillingLabel | null {
    if (!summary) return null
    if (summary.billing_method !== 'invoice') return 'card'
    if (summary.billed_from_economic) return 'economic'
    if (summary.leverandorservice) return 'leverandorservice'

    return 'invoice'
}

export type CompanyTabKey = 'overview' | 'accounts' | 'licenses' | 'apps' | 'agreements' | 'invoices' | 'history' | 'edit' | 'migration'

export type CompanyTab = { key: CompanyTabKey; labelKey: string; href: string; icon: string }

/**
 * Every tab, the permission it needs (the one the page's API asks for), and
 * the route names that count as being on it.
 */
const TAB_DEFINITIONS: Array<{ key: CompanyTabKey; path: string; icon: string; permission: string; routes: string[] }> = [
    { key: 'overview', path: 'overview', icon: 'ph:squares-four', permission: 'view_companies', routes: ['superadmin-companies-company_uuid-overview'] },
    { key: 'accounts', path: 'accounts', icon: 'ph:users-three', permission: 'view_accounts', routes: ['superadmin-companies-company_uuid-accounts', 'superadmin-companies-company_uuid-accounts-new', 'superadmin-companies-company_uuid-accounts-account_uuid-edit'] },
    { key: 'licenses', path: 'license-overview', icon: 'ph:identification-badge', permission: 'view_companies', routes: ['superadmin-companies-company_uuid-license-overview'] },
    { key: 'apps', path: 'apps', icon: 'ic:baseline-apps', permission: 'view_companies', routes: ['superadmin-companies-company_uuid-apps'] },
    { key: 'agreements', path: 'agreements', icon: 'ph:handshake', permission: 'view_financials', routes: ['superadmin-companies-company_uuid-agreements'] },
    { key: 'invoices', path: 'invoices', icon: 'ph:invoice', permission: 'view_financials', routes: ['superadmin-companies-company_uuid-invoices', 'superadmin-companies-company_uuid-invoices-invoice_uuid-invoice-details'] },
    { key: 'history', path: 'history', icon: 'ph:clock-counter-clockwise', permission: 'view_companies', routes: ['superadmin-companies-company_uuid-history'] },
    { key: 'edit', path: 'edit', icon: 'ph:pencil-simple', permission: 'manage_companies', routes: ['superadmin-companies-company_uuid-edit'] },
    // Migration is work we do for a customer, behind manage_imports - only
    // the colleagues who run them see the tab.
    { key: 'migration', path: 'migration', icon: 'ph:arrows-left-right', permission: 'manage_imports', routes: ['superadmin-companies-company_uuid-migration'] },
]

export function companyTabs(companyUuid: string, can: (permission: string) => boolean): CompanyTab[] {
    return TAB_DEFINITIONS
        .filter((tab) => can(tab.permission))
        .map((tab) => ({
            key: tab.key,
            labelKey: `superadmin.companyHeader.tabs.${tab.key}`,
            href: `/superadmin/companies/${companyUuid}/${tab.path}`,
            icon: tab.icon,
        }))
}

export function activeCompanyTab(routeName: string | null | undefined): CompanyTabKey | null {
    if (!routeName) return null

    return TAB_DEFINITIONS.find((tab) => tab.routes.includes(routeName))?.key ?? null
}

/** Every route a company tab lives on - for the sidebar's "Companies" item. */
export const COMPANY_TAB_ROUTES: string[] = TAB_DEFINITIONS.flatMap((tab) => tab.routes)

// ---------------------------------------------------------------- history

export type TimelineType = 'company' | 'account' | 'license' | 'invoice' | 'payment' | 'agreement' | 'billing' | 'access'

export const TIMELINE_TYPES: TimelineType[] = ['company', 'account', 'license', 'invoice', 'payment', 'agreement', 'billing', 'access']

export type TimelineEvent = {
    id: string
    type: TimelineType
    kind: string
    occurred_at: string
    title: string
    params: Record<string, any>
    detail: string | null
    amount: number | null
    actor: { name: string; is_staff: boolean } | null
    link: string | null
}

export const TYPE_ICONS: Record<TimelineType, string> = {
    company: 'ph:buildings',
    account: 'ph:user-plus',
    license: 'ph:identification-badge',
    invoice: 'ph:invoice',
    payment: 'ph:credit-card',
    agreement: 'ph:handshake',
    billing: 'ph:bank',
    access: 'ph:lock-key',
}

const FAILURE_KINDS = ['payment_failed', 'company_suspended', 'sent_to_collection', 'security_card_declined', 'company_deactivated', 'agreement_cancelled', 'impersonation_break_glass', 'support_access_denied']
const PENDING_KINDS = ['invoice_reminder_sent', 'closure_postponed', 'card_link_sent', 'security_card_notice', 'contract_cancelled', 'support_access_requested', 'payment_retried', 'renewal_link_requested']
const OK_KINDS = ['invoice_paid', 'payment_resolved', 'company_reopened', 'company_activated', 'security_card_charged', 'agreement_renewed', 'installments_settled', 'support_access_approved']
const MUTED_KINDS = ['written_off', 'agreement_deleted', 'support_access_revoked', 'license_removed', 'storage_removed', 'app_deactivated', 'app_trial_cancelled', 'contract_cancellation_withdrawn']

/** How an event's dot is coloured. Most events are plain history: info. */
export function eventTone(kind: string): StatusTone {
    if (FAILURE_KINDS.includes(kind)) return 'failure'
    if (PENDING_KINDS.includes(kind)) return 'pending'
    if (OK_KINDS.includes(kind)) return 'ok'
    if (MUTED_KINDS.includes(kind)) return 'muted'

    return 'info'
}

export function eventIcon(type: string): string {
    return TYPE_ICONS[type as TimelineType] ?? 'ph:circle'
}

export type MonthGroup = { key: string; year: number; month: number; events: TimelineEvent[] }

/**
 * Newest month first, events in the order given. The month is the local
 * calendar month of `occurred_at` - an event at 23:30 on the 31st in Denmark
 * belongs to that month, not the next one in UTC.
 */
export function groupEventsByMonth(events: TimelineEvent[], timeZone?: string): MonthGroup[] {
    const groups: MonthGroup[] = []
    const byKey = new Map<string, MonthGroup>()

    for (const event of events) {
        const date = new Date(event.occurred_at)
        if (Number.isNaN(date.getTime())) continue

        const { year, month } = localYearMonth(date, timeZone)
        const key = `${year}-${String(month).padStart(2, '0')}`

        let group = byKey.get(key)
        if (!group) {
            group = { key, year, month, events: [] }
            byKey.set(key, group)
            groups.push(group)
        }
        group.events.push(event)
    }

    return groups.sort((a, b) => (a.key < b.key ? 1 : a.key > b.key ? -1 : 0))
}

function localYearMonth(date: Date, timeZone?: string): { year: number; month: number } {
    if (!timeZone) {
        return { year: date.getFullYear(), month: date.getMonth() + 1 }
    }

    const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit' }).formatToParts(date)

    return {
        year: Number(parts.find((p) => p.type === 'year')?.value),
        month: Number(parts.find((p) => p.type === 'month')?.value),
    }
}

/** Adds the next page, keeping the first copy of an event already shown. */
export function appendEvents(existing: TimelineEvent[], page: TimelineEvent[]): TimelineEvent[] {
    const seen = new Set(existing.map((e) => e.id))

    return [...existing, ...page.filter((e) => !seen.has(e.id))]
}

/** A chip toggled: on adds, off removes. Order follows TIMELINE_TYPES. */
export function toggleType(selected: TimelineType[], type: TimelineType): TimelineType[] {
    const next = selected.includes(type) ? selected.filter((t) => t !== type) : [...selected, type]

    return TIMELINE_TYPES.filter((t) => next.includes(t))
}

/**
 * The `types` query value. Nothing selected, or everything the viewer may see,
 * is no filter at all: the server then sends every type the viewer may see.
 */
export function typesQuery(selected: TimelineType[], available: string[]): string | undefined {
    const chosen = selected.filter((t) => available.includes(t))

    if (!chosen.length || chosen.length === available.length) return undefined

    return chosen.join(',')
}

/** The params a translation interpolates, with null and undefined left out. */
export function eventParams(event: Pick<TimelineEvent, 'params'>): Record<string, string | number> {
    const out: Record<string, string | number> = {}

    for (const [key, value] of Object.entries(event.params ?? {})) {
        if (value === null || value === undefined || value === '') continue
        out[key] = typeof value === 'boolean' ? (value ? 1 : 0) : value
    }

    return out
}
