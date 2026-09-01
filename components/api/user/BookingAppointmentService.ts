import BaseAPIService from '@/components/api/BaseAPIService'

class BookingAppointmentService extends BaseAPIService {
    async getBookingAppointments(params: object): Promise<any> {
        return await this.request(`/user/booking-appointments`, 'GET', params)
    }

    /**
     * Hands a booking to a colleague. The patient keeps their time; it moves to
     * the colleague's day, calendar event and all.
     */
    async assignBookingAppointment(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/booking-appointments/${uuid}/assign`, 'PUT', params)
    }

    async deleteBookingAppointment(uuid: string): Promise<any> {
        return await this.request(`/user/booking-appointments/${uuid}`, 'DELETE')
    }
}

export const bookingAppointmentService = new BookingAppointmentService()
