import BaseAPIService from '@/components/api/BaseAPIService'

class DealService extends BaseAPIService {
    async getDeals(): Promise<any> {
        return await this.request(`/user/deals`, 'GET')
    }
}

export const dealService = new DealService()