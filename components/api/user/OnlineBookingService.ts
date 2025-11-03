import BaseAPIService from '@/components/api/BaseAPIService'

class OnlineBookingService extends BaseAPIService {
    async getCoursesEvents(onlineBookingSettingsLink: any, params: any): Promise<any> {
        return await this.request(`/user/online-booking/${onlineBookingSettingsLink}/courses-events`, 'GET', params)
    }

    async getCourseEvent(coureEventUuid: any): Promise<any> {
        return await this.request(`/user/online-booking/courses-events/${coureEventUuid}`, 'GET')
    }

    async bookCourseEvent(coureEventUuid: any, params: any): Promise<any> {
        return await this.request(`/user/online-booking/courses-events/${coureEventUuid}`, 'POST', params)
    }

    async getBookingSlots(bookingSettingUuid: any, bookingTimeSlotDate: any, params?: any): Promise<any> {
        return await this.request(`/user/online-booking/courses-events/booking-settings/${bookingSettingUuid}/time-slots/${bookingTimeSlotDate}`, 'GET', params)
    }
}

export const onlineBookingService = new OnlineBookingService()