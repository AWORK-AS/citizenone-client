import BaseAPIService from '@/components/api/BaseAPIService'

/**
 * The services a clinic offers for booking - what patients choose between in
 * the patient portal, and what the website widget lists.
 */
class BookingServiceService extends BaseAPIService {
    async getBookingServices(params: object = {}): Promise<any> {
        return await this.request('/user/booking-services', 'GET', params)
    }

    async getBookingService(uuid: string): Promise<any> {
        return await this.request(`/user/booking-services/${uuid}`, 'GET')
    }

    async saveBookingService(params: object): Promise<any> {
        return await this.request('/user/booking-services', 'POST', params)
    }

    async updateBookingService(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/booking-services/${uuid}`, 'PUT', params)
    }

    async deleteBookingService(uuid: string): Promise<any> {
        return await this.request(`/user/booking-services/${uuid}`, 'DELETE')
    }
}

export const bookingServiceService = new BookingServiceService()
