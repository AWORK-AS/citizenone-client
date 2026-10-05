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
    return { due_on: today, amount: 0, label, covers_from: today, covers_to: endsOn || null }
}

export interface AgreementFormState {
    name: string
    starts_on: string
    term_months: number | string
    /** 'months' sends term_months, 'end_date' sends ends_on and leaves the term to the backend. */
    term_mode: 'months' | 'end_date'
    ends_on: string
    renewal_annual_value: number | string
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

export type EconomicStatusKind = 'none' | 'draft' | 'booked' | 'error'

export interface EconomicInvoiceFields {
    economic_draft_number?: number | string | null
    economic_invoice_number?: number | string | null
    economic_sync_error?: string | null
    covered_by_agreement?: boolean
}

/**
 * Where an invoice stands in CitizenOne's own e-conomic. A booked number wins
 * over everything, then a sync error, then a draft. Superadmin screens only.
 */
export function economicStatus(invoice: EconomicInvoiceFields | null | undefined): {
    kind: EconomicStatusKind
    number: string | null
    error: string | null
} {
    const booked = invoice?.economic_invoice_number
    const draft = invoice?.economic_draft_number
    const error = invoice?.economic_sync_error
    const has = (v: unknown) => v !== null && v !== undefined && v !== ''
    if (has(booked)) return { kind: 'booked', number: String(booked), error: null }
    if (has(error)) return { kind: 'error', number: has(draft) ? String(draft) : null, error: String(error) }
    if (has(draft)) return { kind: 'draft', number: String(draft), error: null }
    return { kind: 'none', number: null, error: null }
}

/** A draft can be created (or retried) while nothing is booked, and not for covered invoices. */
export function canCreateEconomicDraft(invoice: EconomicInvoiceFields | null | undefined): boolean {
    if (!invoice || invoice.covered_by_agreement) return false
    const { kind } = economicStatus(invoice)
    return kind === 'none' || kind === 'error'
}

/** i18n key suffix for the draft button: retry after an error. */
export function economicDraftActionKey(invoice: EconomicInvoiceFields | null | undefined): 'create' | 'retry' {
    return economicStatus(invoice).kind === 'error' ? 'retry' : 'create'
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
    if (!company) return false
    const hasNumber = company.economic_customer_number !== null && company.economic_customer_number !== undefined && company.economic_customer_number !== ''
    return !hasNumber && (agreements ?? []).some((a) => a.status === 'active')
}
