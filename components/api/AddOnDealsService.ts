import BaseAPIService from '@/components/api/BaseAPIService'

class AddOnDealsService extends BaseAPIService {
    async getStorageAddOnDeals(): Promise<any> {
        return await this.request(`/user/add-on-deals/storages`, 'GET')
    }
}

export const addOnDealsService = new AddOnDealsService()