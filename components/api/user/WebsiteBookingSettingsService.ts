import BaseAPIService from '@/components/api/BaseAPIService'

class WebsiteBookingSettingsService extends BaseAPIService {
    async getWebsiteBookingSettings(): Promise<any> {
        return await this.request('/user/website-booking-settings', 'GET')
    }

    async saveWebsiteBookingSettings(params: object): Promise<any> {
        return await this.request('/user/website-booking-settings', 'POST', params)
    }
}

export const websiteBookingSettingsService = new WebsiteBookingSettingsService()
