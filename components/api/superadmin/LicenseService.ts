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
        params: { package: string; frequency: 'monthly' | 'yearly'; billing_method: 'manual_invoice' | 'payment_card' },
    ): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/subscription`, 'POST', params)
    }
}

export const licenseService = new LicenseService()
