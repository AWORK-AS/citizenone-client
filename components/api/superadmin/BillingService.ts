import BaseAPIService from '@/components/api/BaseAPIService'
import {
    normalizeBillingMethod,
    normalizeCompanyBilling,
    normalizeDunningStatus,
    type BillingMethodForm,
    type CompanyBilling,
    type DunningAction,
    type DunningInvoice,
    type DunningRow,
} from '@/composables/billingMethod'

/**
 * Billing method, card-as-security and the "Betalingsproblemer" worklist.
 * Superadmin only. The backend authorises every call (`view_financials` to read,
 * `manage_financials` to change); nothing here is access control.
 *
 * This file is the only place that knows the wire shapes: the screens work with
 * the normalised types from composables/billingMethod.ts. If the API names a
 * field differently, change the adapter below and nothing else.
 */
class BillingService extends BaseAPIService {
    /** The company's billing method, flags and the masked security card. */
    async getBillingMethod(companyUuid: string): Promise<CompanyBilling> {
        // The superadmin company resource carries the three flags (and nothing but
        // superadmin sees them), so there is no separate read endpoint.
        const response = await this.request(`/superadmin/companies/${companyUuid}`, 'GET')
        return normalizeCompanyBilling(response)
    }

    /** Dedicated endpoint. Never sent through the ordinary company update. */
    async saveBillingMethod(companyUuid: string, form: BillingMethodForm): Promise<CompanyBilling> {
        const response = await this.request(`/superadmin/companies/${companyUuid}/billing-method`, 'PUT', form)
        return normalizeCompanyBilling(response)
    }

    async getProblems(params: object = {}): Promise<{ rows: DunningRow[]; meta: any }> {
        const response = await this.request(`/superadmin/payment-problems`, 'GET', params)
        const list: any[] = response?.data ?? []

        return { rows: list.map(toDunningRow), meta: response?.meta ?? response ?? {} }
    }

    /** Count for the sidebar badge. */
    async getProblemCount(): Promise<number> {
        const response = await this.request(`/superadmin/payment-problems/count`, 'GET')
        return Number(response?.data?.count ?? response?.count ?? 0)
    }

    /**
     * Every action is written to the activity log by the API. Retry and the security
     * charge answer `{ status, paid, row }`, so the screen can update the row in place;
     * the others answer the row itself (`{ data: row }`) or a plain message.
     */
    async act(companyUuid: string, action: DunningAction, body: { note?: string; days?: number | null } = {}): Promise<DunningActResult> {
        const response = await this.request(`/superadmin/payment-problems/${companyUuid}/${action.replace(/_/g, '-')}`, 'POST', body)
        const data = response?.data ?? null
        const rawRow = data?.row ?? (data?.company ? data : null)

        return {
            status: typeof data?.status === 'string' && data?.row ? data.status : null,
            paid: data?.paid === true,
            row: rawRow ? toDunningRow(rawRow) : null,
        }
    }

    /** Agreement customers can opt their invoices into the security card. */
    async setAgreementCardSecurity(agreementUuid: string, cardSecurity: boolean): Promise<boolean> {
        const response = await this.request(`/superadmin/agreements/${agreementUuid}/card-security`, 'PUT', { card_security: cardSecurity })
        return response?.data?.card_security === true
    }
}

export type DunningActResult = { status: string | null; paid: boolean; row: DunningRow | null }

function toDunningRow(raw: any): DunningRow {
    return {
        company_uuid: raw.company?.uuid ?? raw.company_uuid ?? '',
        company_name: raw.company?.name ?? raw.company_name ?? '',
        billing_method: normalizeBillingMethod(raw.billing_method),
        amount_outstanding: Number(raw.amount_outstanding ?? 0),
        days_overdue: Number(raw.days_overdue ?? 0),
        warnings_sent: Number(raw.warnings_sent ?? 0),
        closes_on: raw.closes_on ?? null,
        status: normalizeDunningStatus(raw.status),
        invoice_card_security: !!raw.invoice_card_security,
        security_card: raw.security_card ? { last_four: raw.security_card.last_four ?? null, expiry: raw.security_card.expiry ?? null } : null,
        invoices: Array.isArray(raw.invoices) ? raw.invoices.map(toDunningInvoice) : [],
        postponed_until: raw.postponed_until ?? null,
        postpone_note: raw.postpone_note ?? null,
        actions: raw.actions ?? {},
    }
}

function toDunningInvoice(raw: any): DunningInvoice {
    return {
        uuid: raw.uuid ?? '',
        invoice_number: String(raw.invoice_number ?? ''),
        total_amount: Number(raw.total_amount ?? 0),
        due_on: raw.due_on ?? null,
        card_security_status: raw.card_security_status ?? null,
    }
}

export const billingService = new BillingService()
