import BaseAPIService from '@/components/api/BaseAPIService'

class LicenseService extends BaseAPIService {
    async getLicenses(companyUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/licenses/${companyUuid}`, 'GET', params)
    }
}

export const licenseService = new LicenseService()