import BaseAPIService from '@/components/api/BaseAPIService'

class LicenseService extends BaseAPIService {
    async getLicenses(params: object): Promise<any> {
        return await this.request(`/user/licenses`, 'GET', params)
    }

    async getCaseworkerLicenses(params: object): Promise<any> {
        return await this.request(`/user/licenses/all/caseworker`, 'GET', params)
    }

    async getLicensesCount(): Promise<any> {
        return await this.request(`/user/licenses/all/count`, 'GET')
    }

    async getDepartmentLicenses(params: object): Promise<any> {
        return await this.request(`/user/departments/settings/list`, 'GET', params)
    }

    async getCaseworkerLicenseConfig(subscriptionId: number): Promise<any> {
        return await this.request(`/user/caseworker-licenses/${subscriptionId}`, 'GET')
    }

    async updateCaseworkerLicenseConfig(subscriptionId: number, payload: object): Promise<any> {
        return await this.request(`/user/caseworker-licenses/${subscriptionId}`, 'PUT', payload)
    }

    async addCaseworkerFolders(subscriptionId: number, payload: object): Promise<any> {
        return await this.request(`/user/caseworker-licenses/${subscriptionId}/folders/add`, 'POST', payload)
    }

    async removeCaseworkerFolders(subscriptionId: number, payload: object): Promise<any> {
        return await this.request(`/user/caseworker-licenses/${subscriptionId}/folders/remove`, 'POST', payload)
    }

    async setCaseworkerFolderAccess(subscriptionId: number, payload: object): Promise<any> {
        return await this.request(`/user/caseworker-licenses/${subscriptionId}/folder-access`, 'POST', payload)
    }
}

export const licenseService = new LicenseService()