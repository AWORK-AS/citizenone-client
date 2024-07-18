import BaseAPIService from '@/components/api/BaseAPIService'

class AddOnDealsService extends BaseAPIService {
    async getStorageAddOnDeals(): Promise<any> {
        return await this.request(`/user/add-on-deals/storages`, 'GET')
    }

    async getDepartmentAddOnDeals(): Promise<any> {
        return await this.request(`/user/add-on-deals/departments`, 'GET')
    }

    async getUserAddOnDeals(): Promise<any> {
        return await this.request(`/user/add-on-deals/users`, 'GET')
    }
}

export const addOnDealsService = new AddOnDealsService()