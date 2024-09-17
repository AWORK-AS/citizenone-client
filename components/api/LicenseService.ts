import BaseAPIService from '@/components/api/BaseAPIService'

class LicenseService extends BaseAPIService {
    async getLicenses(params: object): Promise<any> {
        return await this.request(`/user/licenses`, 'GET', params)
    }
}

export const licenseService = new LicenseService()