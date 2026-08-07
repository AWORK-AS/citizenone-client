import BaseAPIService from '@/components/api/BaseAPIService'

class AppService extends BaseAPIService {
    async getApplications(params?: object): Promise<any> {
        return await this.request('/superadmin/apps', 'GET', params)
    }
    async getApplication(appUuid: string): Promise<any> {
        return await this.request(`/superadmin/apps/${appUuid}`, 'GET')
    }
    async saveApp(params: object): Promise<any> {
        return await this.request('/superadmin/apps', 'POST', params)
    }
    async updateApp(appUuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/apps/${appUuid}/update`, 'POST', params)
    }
    async deleteApp(appUuid: string): Promise<any> {
        return await this.request(`/superadmin/apps/${appUuid}`, 'DELETE')
    }
}

export const appService = new AppService()
