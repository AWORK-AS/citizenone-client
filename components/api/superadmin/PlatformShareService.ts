import BaseAPIService from '@/components/api/BaseAPIService'

class PlatformShareService extends BaseAPIService {
    async getOverview(params: object): Promise<any> {
        return await this.request(`/superadmin/platform-shares`, 'GET', params)
    }
}

export const superadminPlatformShareService = new PlatformShareService()
