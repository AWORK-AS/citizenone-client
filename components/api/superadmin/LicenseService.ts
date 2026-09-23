import BaseAPIService from '@/components/api/BaseAPIService'

class LicenseService extends BaseAPIService {
    // Per-company subscriptions & licenses
    async getSubscription(companyUuid: any): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/subscriptions`, 'GET')
    }
    async getLicenses(companyUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/licenses`, 'GET', params)
    }
    async getLicensesCount(companyUuid: any, type: string = 'user'): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/licenses/all/count`, 'GET', { type })
    }

    // Grant N pool seats of an Application-type license to a company, optionally
    // assigning one seat directly to a named user in the same action.
    async grantApplicationLicense(
        companyUuid: string,
        params: { application_uuid: string; quantity: number; assign_to_user_uuid?: string | null },
    ): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/apps/grant`, 'POST', params)
    }
    async getAppSeatCounts(companyUuid: string, applicationUuid: string): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/apps/${applicationUuid}/seats`, 'GET')
    }

    // Quantifiable apps with an available seat for this company that the given
    // user doesn't already hold - powers the "Assign license" row action.
    async getAssignableAppsForUser(companyUuid: string, userUuid: string): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/users/${userUuid}/assignable-apps`, 'GET')
    }

    // Grant N extra-user licenses to a company's pool (no in-app charge; requires manage_licenses)
    async grantLicenses(companyUuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/licenses/grant`, 'POST', params)
    }

    // All Deals (Basis/Pro) with base pricing, unfiltered by any company context -
    // powers the "add subscription" plan picker for companies with none yet.
    async getDeals(): Promise<any> {
        return await this.request(`/superadmin/deals/all/list`, 'GET')
    }

    // Manually add the company's main Deal subscription (Basis/Pro) when it
    // currently has none - creates a pending Invoice + InvoiceDetail + UserSubscription.
    async addDealSubscription(
        companyUuid: string,
        params: { package: string; frequency: 'monthly' | 'yearly'; billing_method: 'manual_invoice' | 'payment_card' | 'assigned_payment_card' },
    ): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/subscription`, 'POST', params)
    }

    // Change an EXISTING subscription's plan/frequency. credit_amount is only
    // read for a payment_card target (manual-invoice companies get their
    // credit computed server-side).
    async updateDealSubscription(
        companyUuid: string,
        params: {
            package: string
            frequency: 'monthly' | 'yearly'
            billing_method: 'manual_invoice' | 'payment_card'
            credit_amount?: number
        },
    ): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/subscription`, 'PUT', params)
    }

    // Add (positive delta) or remove (negative delta) seats for an
    // already-granted Application.
    async adjustApplicationQuantity(companyUuid: string, applicationUuid: string, delta: number): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/apps/${applicationUuid}/quantity`, 'PATCH', { delta })
    }

    // Pause (activate: false) or resume every seat of an app for a company at once.
    async toggleAppStatus(companyUuid: string, applicationUuid: string, activate: boolean): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/apps/${applicationUuid}/status`, 'PATCH', { activate })
    }

    // Remove one license row - works for both Application seats and AddOnDeal
    // (Extra User/Department) seats.
    async removeLicense(companyUuid: string, licenseUuid: string): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/licenses/${licenseUuid}`, 'DELETE')
    }

    // Extend or shorten the contract length of an already-granted manual
    // yearly license seat or Deal subscription. Invoices only the additional
    // years (or issues a paid credit note for fewer years) at today's price -
    // never re-charges years already invoiced. created_at is optional and
    // only sent when the start date is also being corrected.
    async updateSubscriptionTerm(
        companyUuid: string,
        licenseUuid: string,
        params: { term_years: number; created_at?: string; pays_via_leverandorservice?: boolean },
    ): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/licenses/${licenseUuid}/term`, 'PATCH', params)
    }

    /**
     * Registrér eller fortryd en opsigelse. Begge datoer tomme = ingen opsigelse.
     */
    async updateContractCancellation(companyUuid: string, params: { contract_cancelled_at: string | null; contract_ends_at: string | null }): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/contract/cancellation`, 'PATCH', params)
    }

    // Bulk variant of updateSubscriptionTerm() for the Apps screen, which
    // shows one aggregated row per Application - applies the same term to
    // every active seat this company has for that app at once.
    async updateApplicationSeatsTerm(
        companyUuid: string,
        applicationUuid: string,
        params: { term_years: number; created_at?: string; pays_via_leverandorservice?: boolean },
    ): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/apps/${applicationUuid}/term`, 'PATCH', params)
    }

    // The company's active storage tier (if any) plus current usage/quota.
    async getCompanyStorage(companyUuid: string): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/storage`, 'GET')
    }

    // Grant a storage AddOnDeal tier to a company. If the company already has
    // a different active tier, the backend swaps it (with a prorated credit);
    // granting the same tier again is rejected.
    async grantStorage(
        companyUuid: string,
        params: { add_on_deal_uuid: string; frequency?: 'monthly' | 'yearly'; pays_via_leverandorservice?: boolean },
    ): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/storage/grant`, 'POST', params)
    }

    // Remove the company's active storage tier, crediting the unused portion.
    async removeStorage(companyUuid: string): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/storage`, 'DELETE')
    }
}

export const licenseService = new LicenseService()
