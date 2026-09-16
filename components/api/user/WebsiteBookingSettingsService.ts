import BaseAPIService from '@/components/api/BaseAPIService'

class WebsiteBookingSettingsService extends BaseAPIService {
    async getWebsiteBookingSettings(): Promise<any> {
        return await this.request('/user/website-booking-settings', 'GET')
    }

    async saveWebsiteBookingSettings(params: object): Promise<any> {
        return await this.request('/user/website-booking-settings', 'POST', params)
    }

    async uploadLogo(params: FormData): Promise<any> {
        return await this.request('/user/website-booking-settings/upload-logo', 'POST', params)
    }

    async deleteLogo(): Promise<any> {
        return await this.request('/user/website-booking-settings/delete-logo', 'DELETE')
    }
}

export const websiteBookingSettingsService = new WebsiteBookingSettingsService()
