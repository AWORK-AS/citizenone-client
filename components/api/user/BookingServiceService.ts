import BaseAPIService from '@/components/api/BaseAPIService'

class BookingServiceService extends BaseAPIService {
    async getBookingServices(params: object = {}): Promise<any> {
        return await this.request('/user/booking-services', 'GET', params)
    }
}

export const bookingServiceService = new BookingServiceService()
