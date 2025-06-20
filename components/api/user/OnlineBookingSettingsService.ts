import BaseAPIService from '@/components/api/BaseAPIService'

class OnlineBookingSettingsService extends BaseAPIService {
    async getOnlineBookingSettings(): Promise<any> {
        return await this.request(`/user/online-booking-settings`, 'GET')
    }

    async getOnlineBookingSettingsPerLink(link: any): Promise<any> {
        return await this.request(`/user/online-booking-settings/${link}`, 'GET')
    }

    async saveOnlineBookingSettings(params: object): Promise<any> {
        return await this.request(`/user/online-booking-settings`, 'POST', params)
    }
}

export const onlineBookingSettingsService = new OnlineBookingSettingsService()