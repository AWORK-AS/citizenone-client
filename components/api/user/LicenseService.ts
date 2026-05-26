import BaseAPIService from '@/components/api/BaseAPIService'

class LicenseService extends BaseAPIService {
    async getLicenses(params: object): Promise<any> {
        return await this.request(`/user/licenses`, 'GET', params)
    }

    async getCaseworkerLicenses(params: object): Promise<any> {
        return await this.request(`/user/licenses/all/caseworker`, 'GET', params)
    }

    async getLicensesCount(): Promise<any> {
        return await this.request(`/user/licenses/all/count`, 'GET')
    }

    async getDepartmentLicenses(params: object): Promise<any> {
        return await this.request(`/user/departments/settings/list`, 'GET', params)
    }
}

export const licenseService = new LicenseService()