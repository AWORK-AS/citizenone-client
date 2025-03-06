import BaseAPIService from '@/components/api/BaseAPIService'

class AppService extends BaseAPIService {
    async getApps(params: object): Promise<any> {
        return await this.request(`/superadmin/apps`, 'GET', params)
    }

    async getApp(appUuid: any): Promise<any> {
        return await this.request(`/superadmin/apps/${appUuid}`, 'GET')
    }

    async saveApp(params: object): Promise<any> {
        return await this.request(`/superadmin/apps`, 'POST', params)
    }

    async updateApp(appUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/apps/${appUuid}/update`, 'POST', params)
    }

    async deleteApp(appUuid: any): Promise<any> {
        return await this.request(`/superadmin/apps/${appUuid}`, 'DELETE')
    }

    async activateDeactiveApp(appUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/apps/${appUuid}/toggle-status`, 'PUT', params)
    }
}

export const appService = new AppService()