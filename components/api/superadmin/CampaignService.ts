import BaseAPIService from '@/components/api/BaseAPIService'

class CampaignService extends BaseAPIService {
    async getCampaigns(params?: object): Promise<any> {
        return await this.request('/superadmin/sales-campaigns', 'GET', params)
    }

    async getCampaign(salesCampaignUuid: any): Promise<any> {
        return await this.request(`/superadmin/sales-campaigns/${salesCampaignUuid}`, 'GET')
    }

    async createCampaign(params: object): Promise<any> {
        return await this.request('/superadmin/sales-campaigns', 'POST', params)
    }

    async saveCampaign(formData: FormData): Promise<any> {
        return await this.requestFormData('/superadmin/sales-campaigns', formData)
    }

    async updateCampaign(salesCampaignUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/sales-campaigns/${salesCampaignUuid}/update`, 'POST', params)
    }

    async deleteCampaign(uuid: string): Promise<any> {
        return await this.request(`/superadmin/sales-campaigns/${uuid}`, 'DELETE')
    }

    // Kuponer
    async getCoupons(params?: object): Promise<any> {
        return await this.request('/superadmin/coupons', 'GET', params)
    }
    async createCoupon(params: object): Promise<any> {
        return await this.request('/superadmin/coupons', 'POST', params)
    }
    async updateCoupon(uuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/coupons/${uuid}`, 'PUT', params)
    }
    async deleteCoupon(uuid: string): Promise<any> {
        return await this.request(`/superadmin/coupons/${uuid}`, 'DELETE')
    }

    // Marketingværktøjer
    async extendTrial(companyUuid: string, days: number): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/extend-trial`, 'POST', { days })
    }
    async sendMassCampaign(params: object): Promise<any> {
        return await this.request('/superadmin/sales-campaigns/mass-send', 'POST', params)
    }
    async saveReferralSettings(params: object): Promise<any> {
        return await this.request('/superadmin/settings/referral', 'PUT', params)
    }
    async saveBanner(params: object): Promise<any> {
        return await this.request('/superadmin/settings/banner', 'PUT', params)
    }
    async getBannerSettings(): Promise<any> {
        return await this.request('/superadmin/settings/banner', 'GET')
    }
    async getReferralSettings(): Promise<any> {
        return await this.request('/superadmin/settings/referral', 'GET')
    }
}

export const campaignService = new CampaignService()
