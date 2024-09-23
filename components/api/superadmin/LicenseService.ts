import BaseAPIService from '@/components/api/BaseAPIService'

class LicenseService extends BaseAPIService {
    async getSubscription(companyUuid: any): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/subscriptions`, 'GET')
    }

    async getLicenses(companyUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/licenses`, 'GET', params)
    }

    async getLicensesCount(companyUuid: any): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/licenses/all/count`, 'GET')
    }
}

export const licenseService = new LicenseService()