import BaseAPIService from '@/components/api/BaseAPIService'
import {
    normalizeBillingMethod,
    normalizeCompanyBilling,
    normalizeDunningStatus,
    type BillingMethodForm,
    type CompanyBilling,
    type DunningAction,
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
        const response = await this.request(`/superadmin/companies/${companyUuid}/billing-method`, 'GET')
        return normalizeCompanyBilling(response)
    }

    /** Dedicated endpoint. Never sent through the ordinary company update. */
    async saveBillingMethod(companyUuid: string, form: BillingMethodForm): Promise<CompanyBilling> {
        const response = await this.request(`/superadmin/companies/${companyUuid}/billing-method`, 'PUT', form)
        return normalizeCompanyBilling(response)
    }

    async getProblems(params: object = {}): Promise<{ rows: DunningRow[]; meta: any }> {
        const response = await this.request(`/superadmin/billing-problems`, 'GET', params)
        const list: any[] = response?.data ?? []

        return { rows: list.map(toDunningRow), meta: response?.meta ?? response ?? {} }
    }

    /** Count for the sidebar badge. */
    async getProblemCount(): Promise<number> {
        const response = await this.request(`/superadmin/billing-problems/count`, 'GET')
        return Number(response?.data?.count ?? response?.count ?? 0)
    }

    /** Every action is written to the activity log by the API. */
    async act(companyUuid: string, action: DunningAction, body: { note?: string; days?: number | null } = {}): Promise<any> {
        return await this.request(`/superadmin/billing-problems/${companyUuid}/${action.replace(/_/g, '-')}`, 'POST', body)
    }
}

function toDunningRow(raw: any): DunningRow {
    return {
        company_uuid: raw.company_uuid ?? raw.company?.uuid ?? raw.uuid,
        company_name: raw.company_name ?? raw.company?.name ?? '',
        billing_method: normalizeBillingMethod(raw.billing_method),
        amount_outstanding: Number(raw.amount_outstanding ?? raw.amount ?? 0),
        days_overdue: Number(raw.days_overdue ?? 0),
        warnings_sent: Number(raw.warnings_sent ?? 0),
        closes_on: raw.closes_on ?? raw.closing_date ?? null,
        status: normalizeDunningStatus(raw.status),
        invoice_card_security: !!raw.invoice_card_security,
        has_security_card: !!(raw.has_security_card ?? raw.security_card),
        over_cap: !!raw.over_cap,
    }
}

export const billingService = new BillingService()
