import BaseAPIService from '@/components/api/BaseAPIService'

class SalesCampaignService extends BaseAPIService {
    async getSalesCampaigns(): Promise<any> {
        return await this.request(`/user/sales-campaigns`, 'GET')
    }
}

export const salesCampaignService = new SalesCampaignService()