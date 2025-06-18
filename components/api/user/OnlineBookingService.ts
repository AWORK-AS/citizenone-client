import BaseAPIService from '@/components/api/BaseAPIService'

class OnlineBookingService extends BaseAPIService {
    async getOnlineBooking(): Promise<any> {
        return await this.request(`/user/online-booking`, 'GET')
    }

    async saveOnlineBooking(params: object): Promise<any> {
        return await this.request(`/user/online-booking`, 'POST', params)
    }

    async updateOnlineBooking(bookingUuid: any, params: object): Promise<any> {
        return await this.request(`/user/online-booking/${bookingUuid}/update`, 'POST', params)
    }

    async deleteOnlineBooking(bookingUuid: any): Promise<any> {
        return await this.request(`/user/online-booking/${bookingUuid}`, 'DELETE')
    }
}

export const onlineBookingService = new OnlineBookingService()