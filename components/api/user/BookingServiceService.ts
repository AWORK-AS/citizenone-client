import BaseAPIService from '@/components/api/BaseAPIService'

/**
 * Bookable treatments ("booking services") and their times. A treatment's times
 * hang off its booking setting, so the slot calls take `booking_setting.uuid`.
 */
class BookingServiceService extends BaseAPIService {
    async getBookingServices(params: object = {}): Promise<any> {
        return await this.request('/user/booking-services', 'GET', params)
    }

    async createBookingService(params: object): Promise<any> {
        return await this.request('/user/booking-services', 'POST', params)
    }

    async updateBookingService(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/booking-services/${uuid}`, 'PUT', params)
    }

    async deleteBookingService(uuid: string): Promise<any> {
        return await this.request(`/user/booking-services/${uuid}`, 'DELETE')
    }

    /** Today's and later times, each with `booked` (how many) and `capacity` (seats left). */
    async getTimeSlots(bookingSettingUuid: string): Promise<any> {
        return await this.request(`/user/booking-time-slots/setting/${bookingSettingUuid}`, 'GET')
    }

    /** The same times on every chosen day from `date_start` to `date_end`. */
    async createTimeSlots(bookingSettingUuid: string, params: object): Promise<any> {
        return await this.request(`/user/booking-time-slots/setting/${bookingSettingUuid}`, 'POST', params)
    }

    async deleteTimeSlot(slotUuid: string): Promise<any> {
        return await this.request(`/user/booking-time-slots/${slotUuid}`, 'DELETE')
    }

    /** Clears every time nobody has booked; booked ones stay. */
    async deleteAllTimeSlots(bookingSettingUuid: string): Promise<any> {
        return await this.request(`/user/booking-time-slots/setting/${bookingSettingUuid}/all`, 'DELETE')
    }
}

export const bookingServiceService = new BookingServiceService()
