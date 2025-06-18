import BaseAPIService from '@/components/api/BaseAPIService'

class OnlineBookingService extends BaseAPIService {
    async getOnlineBookingSettings(): Promise<any> {
        return await this.request(`/user/online-booking-settings`, 'GET')
    }

    async saveOnlineBookingSettings(params: object): Promise<any> {
        return await this.request(`/user/online-booking-settings`, 'POST', params)
    }
}

export const onlineBookingService = new OnlineBookingService()