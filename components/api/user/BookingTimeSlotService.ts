import BaseAPIService from '@/components/api/BaseAPIService'

/**
 * The bookable times of a booking setting (a service's, here). Times are
 * rows, one per date and start time; capacity is what is left after bookings.
 */
class BookingTimeSlotService extends BaseAPIService {
    async getTimeSlots(bookingSettingUuid: string): Promise<any> {
        return await this.request(`/user/booking-time-slots/setting/${bookingSettingUuid}`, 'GET')
    }

    /**
     * Lays the given times over every date in the range, on the chosen
     * weekdays (ISO, Monday = 1). Times that already exist are left alone.
     */
    async createTimeSlots(bookingSettingUuid: string, params: object): Promise<any> {
        return await this.request(`/user/booking-time-slots/setting/${bookingSettingUuid}`, 'POST', params)
    }

    async deleteTimeSlot(uuid: string): Promise<any> {
        return await this.request(`/user/booking-time-slots/${uuid}`, 'DELETE')
    }

    /** Removes every time nobody has booked. */
    async deleteUnbookedTimeSlots(bookingSettingUuid: string): Promise<any> {
        return await this.request(`/user/booking-time-slots/setting/${bookingSettingUuid}/all`, 'DELETE')
    }
}

export const bookingTimeSlotService = new BookingTimeSlotService()
