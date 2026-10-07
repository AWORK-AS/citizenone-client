/**
 * Pure helpers behind the company agreements screens.
 *
 * Kept free of Nuxt auto-imports so the logic can be unit tested with
 * `node --test` (see tests/unit/agreements.test.mjs).
 */
import type {
    AgreementPayload,
    InstallmentInput,
    InstallmentPreset,
    LinkableSubscription,
    RunningAgreement,
    SubscriptionAgreement,
    SchedulePreview,
} from '@/types/agreement'

/** Money is compared in whole cents, so 0.1 + 0.2 never fails a sum check. */
export function toCents(value: number | string | null | undefined): number {
    const n = Number(value)
    return Number.isFinite(n) ? Math.round(n * 100) : 0
}

export function fromCents(cents: number): number {
    return Math.round(cents) / 100
}

/** Same tolerance as the backend: 0.01. */
export const SUM_TOLERANCE_CENTS = 1

function pad(n: number): string {
    return String(n).padStart(2, '0')
}

/**
 * Add whole months to an ISO date, clamping to the last day of the target month
 * (31 Jan + 1 month = 28/29 Feb), like the backend's BillingSchedule.
 */
export function addMonthsClamped(isoDate: string, months: number): string {
    const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number)
    const total = (y * 12 + (m - 1)) + months
    const year = Math.floor(total / 12)
    const month = total % 12
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
    return `${year}-${pad(month + 1)}-${pad(Math.min(d, lastDay))}`
}

/**
 * Preset: `upfront_percent` of the contract value on the start date, then
 * `remaining_count` equal installments every `remaining_interval_months`.
 * The last installment absorbs any cent difference so the sum is exact.
 */
export function buildPresetInstallments(
    contractValue: number,
    startsOn: string,
    preset: InstallmentPreset,
    labeler?: (sequence: number, total: number, upfrontPercent: number | null) => string | null,
): InstallmentInput[] {
    const totalCents = toCents(contractValue)
    const count = Math.max(0, Math.floor(Number(preset.remaining_count) || 0))
    const pct = Math.min(100, Math.max(0, Number(preset.upfront_percent) || 0))
    const interval = Math.max(1, Math.floor(Number(preset.remaining_interval_months) || 1))
    if (!startsOn || totalCents <= 0) return []

    const hasUpfront = pct > 0
    const upfrontCents = hasUpfront ? Math.round((totalCents * pct) / 100) : 0
    const restCents = totalCents - upfrontCents
    const total = (hasUpfront ? 1 : 0) + count
    if (total === 0) return []

    const rows: InstallmentInput[] = []
    let seq = 0
    if (hasUpfront) {
        seq++
        rows.push({
            due_on: startsOn,
            amount: fromCents(count === 0 ? totalCents : upfrontCents),
            label: labeler ? labeler(seq, total, pct) : null,
        })
    }
    if (count > 0) {
        const each = Math.floor(restCents / count)
        let allocated = 0
        for (let i = 1; i <= count; i++) {
            seq++
            const cents = i === count ? restCents - allocated : each
            allocated += cents
            rows.push({
                due_on: addMonthsClamped(startsOn, interval * i - (hasUpfront ? 0 : interval)),
                amount: fromCents(cents),
                label: labeler ? labeler(seq, total, null) : null,
            })
        }
    }
    return rows
}

export function installmentsSum(rows: Array<{ amount: number | string }>): number {
    return fromCents(rows.reduce((sum, row) => sum + toCents(row.amount), 0))
}

/** contract_value minus the sum of the list: positive means money not scheduled yet. */
export function installmentsDifference(rows: Array<{ amount: number | string }>, contractValue: number): number {
    const sumCents = rows.reduce((sum, row) => sum + toCents(row.amount), 0)
    return fromCents(toCents(contractValue) - sumCents)
}

export function installmentsMatchContract(rows: Array<{ amount: number | string }>, contractValue: number): boolean {
    const sumCents = rows.reduce((sum, row) => sum + toCents(row.amount), 0)
    return Math.abs(toCents(contractValue) - sumCents) <= SUM_TOLERANCE_CENTS
}

/** End of the binding as the form sees it: the typed end date, or start + term. */
export function bindingEndsOn(form: { starts_on: string; term_mode: 'months' | 'end_date'; ends_on: string; term_months: number | string }): string {
    if (form.term_mode === 'end_date') return form.ends_on || ''
    const months = Math.floor(Number(form.term_months) || 0)
    return form.starts_on && months > 0 ? addMonthsClamped(form.starts_on, months) : ''
}

/**
 * Coverage defaults. Rows in the "installments" plan cover the whole binding
 * (start to end); other plans stay null so the backend fills them in. A value
 * that is already set is never overwritten.
 */
export function withDefaultCoverage<T extends { covers_from?: string | null; covers_to?: string | null }>(
    rows: T[],
    plan: string,
    startsOn: string,
    endsOn: string,
): T[] {
    return rows.map((row) => {
        const from = row.covers_from || (plan === 'installments' && startsOn ? startsOn : null)
        const to = row.covers_to || (plan === 'installments' && endsOn ? endsOn : null)
        return { ...row, covers_from: from, covers_to: to }
    })
}

/** Add-on ("tilkoeb") bought mid-binding: due today, covers today until the binding ends. */
export function buildAddOnInstallment(today: string, endsOn: string, label = 'Tilkøb'): InstallmentInput {
    return {
        due_on: today, amount: 0, label, covers_from: today, covers_to: endsOn || null,
        is_add_on: true, covers_from_manual: false, product_number: null, quantity: null, unit_price: null,
    }
}

/**
 * Where an add-on row's "covers from" should sit after its due date changed.
 * It follows the due date until the user types a value of their own, and it is
 * never later than the due date (an add-on cannot start covering after it is
 * invoiced). Other rows are returned untouched.
 */
export function addOnCoversFromAfterDueOn(row: {
    is_add_on?: boolean
    due_on?: string | null
    covers_from?: string | null
    covers_from_manual?: boolean
}): string | null {
    const current = row.covers_from || null
    if (!row.is_add_on || !row.due_on) return current
    if (!row.covers_from_manual || !current) return row.due_on
    return current > row.due_on ? row.due_on : current
}

export interface SubscriptionGroup<T extends LinkableSubscription = LinkableSubscription> {
    key: string
    label: string
    deal_type: LinkableSubscription['deal_type']
    items: T[]
    /** uuids that can be toggled from this agreement (not linked to another one). */
    selectable: string[]
    /** How many sit on another agreement: shown, never toggled by the group. */
    elsewhere: number
}

export type TriState = 'none' | 'some' | 'all'

function isLinkedToOtherAgreement(option: LinkableSubscription, agreementUuid: string | null | undefined): boolean {
    return !!option.company_agreement_uuid && option.company_agreement_uuid !== agreementUuid
}

const DEAL_ORDER = ['deal', 'add_on_deal', 'application']
const dealRank = (type: string) => { const i = DEAL_ORDER.indexOf(type); return i === -1 ? DEAL_ORDER.length : i }

/** One group per product (label + deal type), by label then deal type, licences by user name. */
export function groupSubscriptions<T extends LinkableSubscription>(
    options: T[],
    agreementUuid: string | null | undefined,
): SubscriptionGroup<T>[] {
    const groups = new Map<string, SubscriptionGroup<T>>()
    for (const option of options) {
        const dealType = option.deal_type ?? 'deal'
        const key = `${option.label}|${dealType}`
        let group = groups.get(key)
        if (!group) {
            group = { key, label: option.label, deal_type: dealType, items: [], selectable: [], elsewhere: 0 }
            groups.set(key, group)
        }
        group.items.push(option)
        if (isLinkedToOtherAgreement(option, agreementUuid)) group.elsewhere++
        else group.selectable.push(option.uuid)
    }
    const collator = new Intl.Collator('da', { sensitivity: 'base', numeric: true })
    return [...groups.values()]
        .map((g) => ({ ...g, items: [...g.items].sort((a, b) => collator.compare(a.user_name ?? '', b.user_name ?? '')) }))
        .sort((a, b) => collator.compare(a.label, b.label) || dealRank(a.deal_type) - dealRank(b.deal_type))
}

/** Checked / total of the toggleable licences in a group and the tri-state of its checkbox. */
export function groupSelection(group: { selectable: string[] }, linked: string[]): { checked: number; total: number; state: TriState } {
    const set = new Set(linked)
    const checked = group.selectable.filter((uuid) => set.has(uuid)).length
    const total = group.selectable.length
    return { checked, total, state: checked === 0 ? 'none' : checked === total ? 'all' : 'some' }
}

/** Group checkbox click: everything on unless it already is, then everything off. Others are kept. */
export function toggleGroupLinks(group: { selectable: string[] }, linked: string[]): string[] {
    const { state } = groupSelection(group, linked)
    return setLinks(group.selectable, linked, state !== 'all')
}

/** "Vaelg alle" / "Fravaelg alle" over several groups. */
export function setGroupsLinked(groups: { selectable: string[] }[], linked: string[], on: boolean): string[] {
    return setLinks(groups.flatMap((g) => g.selectable), linked, on)
}

function setLinks(uuids: string[], linked: string[], on: boolean): string[] {
    if (on) return [...new Set([...linked, ...uuids])]
    const drop = new Set(uuids)
    return linked.filter((uuid) => !drop.has(uuid))
}

/** The renewal period field: empty or invalid is null (the backend reads null as 12). */
export function renewalTermMonths(value: unknown): number | null {
    const n = toNumberOrNull(value)
    return n !== null && Number.isInteger(n) && n > 0 ? n : null
}

/** Months and invoicing of a renewal as the screens show them; null months means 12. */
export function renewalSummary(agreement: {
    renewal_term_months?: number | null
    renewal_billing?: 'upfront' | 'yearly' | 'monthly' | 'by_agreement' | null
}): { months: number; billing: 'upfront' | 'yearly' | 'monthly' | 'by_agreement' | 'plan' } {
    return {
        months: renewalTermMonths(agreement.renewal_term_months) ?? 12,
        billing: agreement.renewal_billing ?? 'plan',
    }
}

export interface AgreementFormState {
    name: string
    starts_on: string
    term_months: number | string
    /** 'months' sends term_months, 'end_date' sends ends_on and leaves the term to the backend. */
    term_mode: 'months' | 'end_date'
    ends_on: string
    renewal_annual_value: number | string
    /** '' = 12 (the backend default). */
    renewal_term_months?: number | string
    /** '' = follow the payment plan. */
    renewal_billing?: '' | 'upfront' | 'yearly' | 'monthly' | 'by_agreement'
    notice_months: number | string
    auto_renews: boolean
    billing_plan: AgreementPayload['billing_plan']
    prepaid_years: number | string | null
    contract_value: number | string
    fee_per_invoice: number | string
    payment_method: AgreementPayload['payment_method']
    internal_note: string
    settled_externally_before: string
    settled_note: string
    preset: { upfront_percent: number | string; remaining_count: number | string; remaining_interval_months: number | string }
    installments: InstallmentInput[]
    /** True once somebody edited the list by hand after applying the preset. */
    installmentsEdited: boolean
    presetApplied: boolean
}

/**
 * Build the request body. For the "installments" plan the body carries either
 * the preset (untouched list: the server computes the schedule) or the explicit
 * list (hand-edited): never both, as the contract says.
 */
export function buildAgreementPayload(form: AgreementFormState): AgreementPayload {
    const isInstallments = form.billing_plan === 'installments'
    const useExplicit = isInstallments && (form.installmentsEdited || !form.presetApplied) && form.installments.length > 0

    return {
        name: form.name.trim(),
        starts_on: form.starts_on,
        ...(form.term_mode === 'end_date'
            ? { ends_on: form.ends_on }
            : { term_months: Number(form.term_months) }),
        notice_months: Number(form.notice_months),
        auto_renews: !!form.auto_renews,
        billing_plan: form.billing_plan,
        prepaid_years: form.billing_plan === 'prepaid_multi_year' ? Number(form.prepaid_years) || null : null,
        contract_value: Number(form.contract_value),
        renewal_annual_value: form.renewal_annual_value === '' || form.renewal_annual_value === null
            ? null
            : Number(form.renewal_annual_value),
        renewal_term_months: renewalTermMonths(form.renewal_term_months),
        renewal_billing: form.renewal_billing ? form.renewal_billing : null,
        fee_per_invoice: Number(form.fee_per_invoice) || 0,
        payment_method: form.payment_method,
        internal_note: form.internal_note?.trim() ? form.internal_note.trim() : null,
        settled_externally_before: form.settled_externally_before ? form.settled_externally_before : null,
        settled_note: form.settled_note?.trim() ? form.settled_note.trim() : null,
        installment_preset: isInstallments && !useExplicit && form.presetApplied
            ? {
                upfront_percent: Number(form.preset.upfront_percent),
                remaining_count: Number(form.preset.remaining_count),
                remaining_interval_months: Number(form.preset.remaining_interval_months),
            }
            : null,
        installments: useExplicit
            ? withDefaultCoverage(form.installments, form.billing_plan, form.starts_on, bindingEndsOn(form)).map((row) => ({
                due_on: row.due_on,
                amount: Number(row.amount),
                label: row.label ? row.label : null,
                covers_from: row.covers_from || null,
                covers_to: row.covers_to || null,
                // Add-on rows: amount = quantity x unit price when both are set.
                ...(isAddOnRow(row) ? addOnPayloadFields(row) : {}),
            }))
            : null,
    }
}

/**
 * The API wraps single resources in `data` and the preview may return either a
 * bare list or `{ installments }`. Accept all of them.
 */
export function unwrapData<T = any>(response: any): T {
    return (response && typeof response === 'object' && 'data' in response ? response.data : response) as T
}

export function unwrapInstallments(response: any): InstallmentInput[] {
    const body = unwrapData(response)
    if (Array.isArray(body)) return body
    if (Array.isArray(body?.installments)) return body.installments
    return []
}

/** Preview body: the installments plus the derived dates and contract MRR/ARR. */
export function unwrapPreview(response: any): SchedulePreview {
    const body = unwrapData<any>(response)
    return {
        installments: unwrapInstallments(response),
        ends_on: body?.ends_on,
        notice_deadline: body?.notice_deadline,
        contract_value: body?.contract_value,
        contract_mrr: body?.contract_mrr,
        contract_arr: body?.contract_arr,
        total: body?.total,
    }
}

/** An invoice that is neither on an installment nor covered by an agreement can be linked or covered. */
export function isInvoiceFree(invoice: any): boolean {
    return !invoice?.covered_by_agreement && !invoice?.company_agreement_installment_id
}

/** The installment the backend creates when an agreement is cancelled with the rest accelerated. */
export function isCancellationRemainder(label: string | null | undefined): boolean {
    return !!label && label.trim().toLowerCase().startsWith('restbeløb ved opsigelse')
}

export interface AgreementTemplate {
    key: 'a4' | 'memox' | 'monthly' | 'empty'
    values: {
        term_months: number
        billing_plan: 'monthly' | 'installments'
        payment_method: 'bank_transfer' | 'card'
        fee_per_invoice: number
        notice_months: number
        auto_renews: boolean
        preset: { upfront_percent: number; remaining_count: number; remaining_interval_months: number } | null
    } | null
}

/** Quick-start shapes. Every field stays editable after one is picked. */
export const AGREEMENT_TEMPLATES: AgreementTemplate[] = [
    {
        key: 'a4',
        values: {
            term_months: 48, billing_plan: 'installments', payment_method: 'bank_transfer', fee_per_invoice: 295,
            notice_months: 3, auto_renews: true,
            preset: { upfront_percent: 25, remaining_count: 3, remaining_interval_months: 12 },
        },
    },
    {
        key: 'memox',
        values: {
            term_months: 48, billing_plan: 'installments', payment_method: 'bank_transfer', fee_per_invoice: 295,
            notice_months: 3, auto_renews: true,
            preset: { upfront_percent: 30, remaining_count: 3, remaining_interval_months: 12 },
        },
    },
    {
        key: 'monthly',
        values: {
            term_months: 12, billing_plan: 'monthly', payment_method: 'bank_transfer', fee_per_invoice: 0,
            notice_months: 3, auto_renews: true, preset: null,
        },
    },
    { key: 'empty', values: null },
]

export type NoticeTone = 'none' | 'passed' | 'soon' | 'ok'

/**
 * How close the notice deadline is. Within 90 days is "soon": the point at which
 * somebody has to decide whether to renegotiate.
 */
export function noticeStatus(
    noticeDeadline: string | null | undefined,
    today: Date = new Date(),
    soonDays = 90,
): { tone: NoticeTone; days: number | null } {
    if (!noticeDeadline) return { tone: 'none', days: null }
    const [y, m, d] = noticeDeadline.slice(0, 10).split('-').map(Number)
    const deadline = Date.UTC(y, m - 1, d)
    const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    const days = Math.round((deadline - now) / 86_400_000)
    if (days < 0) return { tone: 'passed', days }
    if (days <= soonDays) return { tone: 'soon', days }
    return { tone: 'ok', days }
}

/** Agreement and bank-transfer invoices are never paid through the in-app card flow. */
export function isBankTransferInvoice(invoice: any): boolean {
    return invoice?.invoice_type === 'bank_transfer' || invoice?.type === 'agreement'
}

export type InvoicePaymentState = 'covered' | 'paid' | 'failed' | 'bank_transfer_unpaid' | 'unpaid' | 'unknown'

/**
 * What the invoice detail footer says. The text used to be a constant that read
 * "already paid" on unpaid invoices; it now follows is_paid / status and
 * invoice_type. When the API sends neither, nothing is claimed ('unknown').
 */
export function invoicePaymentState(invoice: any): InvoicePaymentState {
    if (!invoice) return 'unknown'
    if (invoice.covered_by_agreement === true) return 'covered'
    if (invoice.is_paid === true || invoice.status === 'paid') return 'paid'
    if (invoice.status === 'failed') return 'failed'
    const hasPaymentInfo = invoice.is_paid === false || (typeof invoice.status === 'string' && invoice.status !== '')
    if (!hasPaymentInfo) return 'unknown'
    return isBankTransferInvoice(invoice) ? 'bank_transfer_unpaid' : 'unpaid'
}

export interface ForecastBucketTotals {
    contracted: number
    assumed: number
    installments: number
    assumed_renewal: number
}

/** Sum the four forecast buckets over the months. Missing buckets count as 0. */
export function forecastBucketTotals(months: any[]): ForecastBucketTotals {
    const totals: ForecastBucketTotals = { contracted: 0, assumed: 0, installments: 0, assumed_renewal: 0 }
    for (const month of months ?? []) {
        totals.contracted += Number(month?.contracted ?? 0)
        totals.assumed += Number(month?.assumed ?? 0)
        totals.installments += Number(month?.installments ?? 0)
        totals.assumed_renewal += Number(month?.assumed_renewal ?? 0)
    }
    return totals
}

export type EconomicSyncState =
    | 'pending' | 'in_flight' | 'created' | 'unknown' | 'failed' | 'draft_missing' | 'booked' | 'paid'

export const ECONOMIC_SYNC_STATES: EconomicSyncState[] = [
    'pending', 'in_flight', 'created', 'unknown', 'failed', 'draft_missing', 'booked', 'paid',
]

export interface EconomicInvoiceFields {
    type?: string | null
    /** Superadmin only: the invoice belongs to an agreement instalment. */
    linked_to_installment?: boolean
    economic_draft_number?: number | string | null
    economic_invoice_number?: number | string | null
    economic_sync_state?: string | null
    economic_sync_error?: string | null
    covered_by_agreement?: boolean
    is_paid?: boolean
    paid_source?: string | null
}

const SYNC_CHIP: Record<EconomicSyncState, { color: 'gray' | 'green' | 'red' | 'amber' | 'navy'; icon: string }> = {
    pending: { color: 'gray', icon: 'ph:clock' },
    in_flight: { color: 'navy', icon: 'ph:arrows-clockwise' },
    created: { color: 'gray', icon: 'ph:file-dashed' },
    unknown: { color: 'amber', icon: 'ph:question' },
    failed: { color: 'red', icon: 'ph:warning' },
    draft_missing: { color: 'red', icon: 'ph:file-x' },
    booked: { color: 'green', icon: 'ph:check-circle' },
    paid: { color: 'green', icon: 'ph:coins' },
}

/** The sync state of an invoice, or null when the API sent none (or one we do not know). */
export function economicSyncState(invoice: EconomicInvoiceFields | null | undefined): EconomicSyncState | null {
    const state = invoice?.economic_sync_state
    return state && (ECONOMIC_SYNC_STATES as string[]).includes(state) ? (state as EconomicSyncState) : null
}

/**
 * Chip for the e-conomic state of an invoice, or null when there is nothing to
 * show. The number is the booked number for booked/paid, otherwise the draft
 * number. The i18n keys are superadmin.agreements.economic.state.{state} and
 * ...state.{state}Help. Superadmin screens only.
 */
export function economicStatus(invoice: EconomicInvoiceFields | null | undefined): {
    state: EconomicSyncState
    color: string
    icon: string
    number: string | null
    error: string | null
} | null {
    const state = economicSyncState(invoice)
    if (!state) return null
    const has = (v: unknown) => v !== null && v !== undefined && v !== ''
    const booked = state === 'booked' || state === 'paid'
    const raw = booked ? invoice?.economic_invoice_number : invoice?.economic_draft_number
    return {
        state,
        ...SYNC_CHIP[state],
        number: has(raw) ? String(raw) : null,
        error: has(invoice?.economic_sync_error) ? String(invoice?.economic_sync_error) : null,
    }
}

/** Only agreement instalment invoices go to e-conomic, never shop or card invoices. */
export function isEconomicEligible(invoice: EconomicInvoiceFields | null | undefined): boolean {
    return !!invoice && invoice.type === 'agreement' && invoice.linked_to_installment === true && !invoice.covered_by_agreement
}

/** The "create draft" button: nothing created yet (no state, pending) or failed. */
export function canCreateEconomicDraft(invoice: EconomicInvoiceFields | null | undefined): boolean {
    if (!isEconomicEligible(invoice) || invoice?.is_paid) return false
    const state = economicSyncState(invoice)
    return state === null || state === 'pending' || state === 'failed'
}

/** "Opret igen" is only for a draft that no longer exists in e-conomic (needs {recreate: true}). */
export function canRecreateEconomicDraft(invoice: EconomicInvoiceFields | null | undefined): boolean {
    return isEconomicEligible(invoice) && economicSyncState(invoice) === 'draft_missing'
}

/** i18n key suffix for the draft button: retry after a failure. */
export function economicDraftActionKey(invoice: EconomicInvoiceFields | null | undefined): 'create' | 'retry' {
    return economicSyncState(invoice) === 'failed' ? 'retry' : 'create'
}

/** Body of the draft call: `{recreate: true}` only for a recreate, nothing otherwise. */
export function economicDraftPayload(recreate: boolean): { recreate: true } | undefined {
    return recreate ? { recreate: true } : undefined
}

/** Poll while the job runs: every few seconds, for about a minute. */
export const ECONOMIC_POLL_INTERVAL_MS = 3000
export const ECONOMIC_POLL_MAX_ATTEMPTS = 20

export function shouldKeepPollingEconomic(invoice: EconomicInvoiceFields | null | undefined, attempt: number): boolean {
    return economicSyncState(invoice) === 'in_flight' && attempt < ECONOMIC_POLL_MAX_ATTEMPTS
}

/** The payment on the invoice was registered by the daily e-conomic sync. */
export function isEconomicSyncedPayment(invoice: EconomicInvoiceFields | null | undefined): boolean {
    return invoice?.paid_source === 'economic_sync'
}

// ---- Add-on (tilkoeb) rows: product number, quantity and unit price ----

export const ADDON_PRODUCT_SUGGESTIONS = [
    { number: 3174, key: 'userLicense' },
    { number: 3176, key: 'departmentLicense' },
] as const

const toNumberOrNull = (v: unknown): number | null => {
    if (v === '' || v === null || v === undefined) return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
}

/** quantity x unit price, rounded to oere; null until both are set. */
export function addOnAmount(quantity: unknown, unitPrice: unknown): number | null {
    const q = toNumberOrNull(quantity)
    const p = toNumberOrNull(unitPrice)
    if (q === null || p === null) return null
    return Math.round(Math.round(q * 100) * Math.round(p * 100) / 100) / 100
}

/** The amount field is read-only while quantity and unit price are both set. */
export function addOnAmountIsComputed(row: { quantity?: unknown; unit_price?: unknown }): boolean {
    return addOnAmount(row.quantity, row.unit_price) !== null
}

/** The fields added to an installment[] entry of an add-on row; the amount follows qty x price. */
export function addOnPayloadFields(row: { amount?: unknown; product_number?: unknown; quantity?: unknown; unit_price?: unknown }) {
    const f = addOnFields(row)
    const computed = addOnAmount(f.quantity, f.unit_price)
    return computed !== null ? { ...f, amount: computed } : f
}

/** Row fields as sent to the API: the three add-on fields, null when empty. */
export function addOnFields(row: { product_number?: unknown; quantity?: unknown; unit_price?: unknown }): {
    product_number: number | null
    quantity: number | null
    unit_price: number | null
} {
    const product = toNumberOrNull(row.product_number)
    return {
        product_number: product !== null && Number.isInteger(product) && product > 0 ? product : null,
        quantity: toNumberOrNull(row.quantity),
        unit_price: toNumberOrNull(row.unit_price),
    }
}

/** Show the add-on fields on rows created with "Tilfoej tilkoeb", or rows that already carry them. */
export function isAddOnRow(row: { is_add_on?: boolean; product_number?: unknown; quantity?: unknown; unit_price?: unknown }): boolean {
    return !!row.is_add_on || addOnFields(row).product_number !== null
        || toNumberOrNull(row.quantity) !== null || toNumberOrNull(row.unit_price) !== null
}

/** "e-conomic kundenummer" as sent to the API: empty is null, otherwise an integer. */
export function parseEconomicCustomerNumber(value: unknown): number | null {
    if (value === '' || value === null || value === undefined) return null
    const n = Number(value)
    return Number.isInteger(n) && n > 0 ? n : null
}

/** Warn when the company has a running agreement but no e-conomic customer number. */
export function missingEconomicNumber(
    company: { economic_customer_number?: number | string | null } | null | undefined,
    agreements: Array<{ status: string }> | null | undefined,
): boolean {
    // An API that does not send the field yet (undefined) is not a missing number.
    if (!company || company.economic_customer_number === undefined) return false
    const hasNumber = company.economic_customer_number !== null && company.economic_customer_number !== ''
    return !hasNumber && (agreements ?? []).some((a) => a.status === 'active')
}

const textOrNull = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null)

/**
 * What the subscriptions response says about the company's agreement. Both blocks
 * are optional (older API, or no agreement): everything missing comes back as
 * null / [] so the card falls back to the plain subscription view.
 */
export function subscriptionAgreementView(data: any): {
    agreement: SubscriptionAgreement | null
    runningAgreements: RunningAgreement[]
} {
    const raw = data?.agreement
    const agreement: SubscriptionAgreement | null = raw && typeof raw === 'object' && (raw.uuid || raw.name)
        ? {
            uuid: String(raw.uuid ?? ''),
            name: String(raw.name ?? ''),
            starts_on: textOrNull(raw.starts_on),
            ends_on: textOrNull(raw.ends_on),
            term_months: toNumberOrNull(raw.term_months),
            notice_deadline: textOrNull(raw.notice_deadline),
            auto_renews: !!raw.auto_renews,
            billing_plan: textOrNull(raw.billing_plan),
            contract_value: raw.contract_value ?? null,
            contract_mrr: raw.contract_mrr ?? null,
            contract_arr: raw.contract_arr ?? null,
            estimated_renewal_annual_value: toNumberOrNull(raw.estimated_renewal_annual_value),
            renewal_value_source: textOrNull(raw.renewal_value_source),
            renewal_term_months: renewalTermMonths(raw.renewal_term_months),
            renewal_billing: ['upfront', 'yearly', 'monthly', 'by_agreement'].includes(raw.renewal_billing) ? raw.renewal_billing : null,
            renewal_plan_missing: raw.renewal_plan_missing === true,
            renewal_plan_due: textOrNull(raw.renewal_plan_due),
            contract_mrr_estimated: raw.contract_mrr_estimated === true,
            estimated_renewal_period_value: toNumberOrNull(raw.estimated_renewal_period_value),
            status: textOrNull(raw.status),
        }
        : null

    const running = Array.isArray(data?.running_agreements) ? data.running_agreements : []
    const runningAgreements: RunningAgreement[] = running
        .filter((r: any) => r && typeof r === 'object' && (r.uuid || r.name))
        .map((r: any) => ({
            uuid: String(r.uuid ?? ''), name: String(r.name ?? ''),
            starts_on: textOrNull(r.starts_on), ends_on: textOrNull(r.ends_on),
        }))

    return { agreement, runningAgreements }
}

/** Amber "rateplan mangler" state of an agreement or a Ledelse row; only a literal true counts. */
export function renewalPlanMissing(row: { renewal_plan_missing?: unknown } | null | undefined): boolean {
    return row?.renewal_plan_missing === true
}

/** Contract MRR that includes a renewal without a plan is an estimate. */
export function contractMrrIsEstimated(row: { contract_mrr_estimated?: unknown } | null | undefined): boolean {
    return row?.contract_mrr_estimated === true
}

/** recurring_revenue.renewals_without_plan as a whole number >= 0 (absent on an older API). */
export function renewalsWithoutPlan(recurringRevenue: { renewals_without_plan?: unknown } | null | undefined): number {
    const n = toNumberOrNull(recurringRevenue?.renewals_without_plan)
    return n !== null && n > 0 ? Math.floor(n) : 0
}

/**
 * The empty installment the "Tilfoej rateplan for ny periode" button opens the form with:
 * due on the renewal date (renewal_plan_due, else the day the binding ends), covering from then.
 */
export function renewalPlanInstallment(agreement: { renewal_plan_due?: string | null; ends_on?: string | null }): InstallmentInput {
    const due = agreement.renewal_plan_due || agreement.ends_on || ''
    return { due_on: due, amount: 0, label: null, covers_from: due || null, covers_to: null }
}

/**
 * The customer's own user resource carries one flag about a company agreement,
 * `user_subscription.under_agreement`. Only a literal true switches the pages to
 * "CitizenOne Elite"; null (no subscription), absent or anything else leaves them unchanged.
 */
export function isUnderAgreement(subscription: { under_agreement?: unknown } | null | undefined): boolean {
    return subscription?.under_agreement === true
}

/** "used of total" for the Elite card; null while the counts are not loaded. */
export function licenceUsage(counts: { used?: unknown; unused?: unknown } | null | undefined): { used: number; total: number } | null {
    const used = toNumberOrNull(counts?.used)
    const unused = toNumberOrNull(counts?.unused)
    if (used === null || unused === null) return null
    return { used, total: used + unused }
}
