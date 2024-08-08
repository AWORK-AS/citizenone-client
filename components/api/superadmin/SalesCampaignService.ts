import BaseAPIService from '@/components/api/BaseAPIService'

class SalesCampaignService extends BaseAPIService {
    async getSalesCampaigns(params: object): Promise<any> {
        return await this.request(`/superadmin/sales-campaigns`, 'GET', params)
    }

    async getSalesCampaign(salesCampaignUuid: any): Promise<any> {
        return await this.request(`/superadmin/sales-campaigns/${salesCampaignUuid}`, 'GET')
    }

    async saveSalesCampaign(params: object): Promise<any> {
        return await this.request(`/superadmin/sales-campaigns`, 'POST', params)
    }

    async updateSalesCampaign(salesCampaignUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/sales-campaigns/${salesCampaignUuid}/update`, 'POST', params)
    }
}

export const salesCampaignService = new SalesCampaignService()