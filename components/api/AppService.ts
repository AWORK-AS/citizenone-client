import BaseAPIService from '@/components/api/BaseAPIService'

class AppService extends BaseAPIService {
    async getApps(params: object): Promise<any> {
        return await this.request(`/user/apps`, 'GET', params)
    }

    async activateApp(appUuid: object): Promise<any> {
        return await this.request(`/user/apps/${appUuid}/purchase`, 'POST')
    }
}

export const appService = new AppService()