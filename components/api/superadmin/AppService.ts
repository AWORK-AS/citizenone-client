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
        return await this.request(`/superadmin/apps/${appUuid}`, 'PUT', params)
    }
    async deleteApp(appUuid: string): Promise<any> {
        return await this.request(`/superadmin/apps/${appUuid}`, 'DELETE')
    }
    // Assign an app directly to a company account
    async assignAppToCompany(appUuid: string, companyUuid: string): Promise<any> {
        return await this.request(`/superadmin/apps/${appUuid}/assign`, 'POST', { company_uuid: companyUuid })
    }
    // Get companies using a specific app
    async getAppCompanies(appUuid: string): Promise<any> {
        return await this.request(`/superadmin/apps/${appUuid}/companies`, 'GET')
    }
}

export const appService = new AppService()
