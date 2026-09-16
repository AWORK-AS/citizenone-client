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

    // Per-app sales: what each app earns per month, who bought it, who left.
    async getSales(params?: object): Promise<any> {
        return await this.request('/superadmin/apps/catalogue/sales', 'GET', params)
    }

    // The order the store draws its shelves in, sent as one list after a drag.
    async reorder(items: object[]): Promise<any> {
        return await this.request('/superadmin/apps/catalogue/reorder', 'POST', { items })
    }

    async addScreenshot(appUuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/apps/${appUuid}/screenshots`, 'POST', params)
    }

    async deleteScreenshot(screenshotUuid: string): Promise<any> {
        return await this.request(`/superadmin/apps/screenshots/${screenshotUuid}`, 'DELETE')
    }
}

export const appService = new AppService()
