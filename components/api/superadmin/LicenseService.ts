import BaseAPIService from '@/components/api/BaseAPIService'

class LicenseService extends BaseAPIService {
    // Per-company subscriptions & licenses
    async getSubscription(companyUuid: any): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/subscriptions`, 'GET')
    }
    async getLicenses(companyUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/licenses`, 'GET', params)
    }
    async getLicensesCount(companyUuid: any): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/licenses/all/count`, 'GET')
    }

    // Platform-level license type management (App Licenser page)
    async getLicenseTypes(appUuid: string): Promise<any> {
        return await this.request(`/superadmin/apps/${appUuid}/license-types`, 'GET')
    }
    async createLicenseType(appUuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/apps/${appUuid}/license-types`, 'POST', params)
    }
    async updateLicenseType(appUuid: string, licenseTypeUuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/apps/${appUuid}/license-types/${licenseTypeUuid}`, 'PUT', params)
    }
    async deleteLicenseType(appUuid: string, licenseTypeUuid: string): Promise<any> {
        return await this.request(`/superadmin/apps/${appUuid}/license-types/${licenseTypeUuid}`, 'DELETE')
    }

    // Assign a license type to a specific company
    async assignLicenseToCompany(companyUuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/licenses`, 'POST', params)
    }
}

export const licenseService = new LicenseService()
