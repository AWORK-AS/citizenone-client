import BaseAPIService from '@/components/api/BaseAPIService'

class BookingTagService extends BaseAPIService {
    async getBookingTags(params: object): Promise<any> {
        return await this.request(`/user/booking-tags`, 'GET', params)
    }

    async getBookingTag(bookingTagUuid: any): Promise<any> {
        return await this.request(`/user/booking-tags/${bookingTagUuid}`, 'GET')
    }

    async saveBookingTag(params: object): Promise<any> {
        return await this.request(`/user/booking-tags`, 'POST', params)
    }

    async updateBookingTag(bookingTagUuid: any, params: object): Promise<any> {
        return await this.request(`/user/booking-tags/${bookingTagUuid}`, 'PUT', params)
    }

    async deleteBookingTag(bookingTagUuid: any): Promise<any> {
        return await this.request(`/user/booking-tags/${bookingTagUuid}`, 'DELETE')
    }

    async getAllBookingTags(): Promise<any> {
        return await this.request(`/user/booking-tags/all/list`, 'GET')
    }
}

export const bookingTagService = new BookingTagService()