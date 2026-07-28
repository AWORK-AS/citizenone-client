import BaseAPIService from '@/components/api/BaseAPIService'

class StoragePackageService extends BaseAPIService {
    async getStoragePackages(): Promise<any> {
        return await this.request('/superadmin/add-on-deals/storage', 'GET')
    }
    async createStoragePackage(params: object): Promise<any> {
        return await this.request('/superadmin/add-on-deals/storage', 'POST', params)
    }
    async updateStoragePackage(uuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/add-on-deals/storage/${uuid}`, 'PUT', params)
    }
    async deleteStoragePackage(uuid: string): Promise<any> {
        return await this.request(`/superadmin/add-on-deals/storage/${uuid}`, 'DELETE')
    }
}

export const storagePackageService = new StoragePackageService()
