import BaseAPIService from '@/components/api/BaseAPIService'

class AppService extends BaseAPIService {
    async getApps(params: object): Promise<any> {
        return await this.request(`/user/apps`, 'GET', params)
    }
}

export const appService = new AppService()