import BaseAPIService from '@/components/api/user/BaseAPIService'

class LicenseService extends BaseAPIService {
    async getLicenses(params: object): Promise<any> {
        return await this.request(`/user/licenses`, 'GET', params)
    }

    async getLicensesCount(): Promise<any> {
        return await this.request(`/user/licenses/all/count`, 'GET')
    }
}

export const licenseService = new LicenseService()