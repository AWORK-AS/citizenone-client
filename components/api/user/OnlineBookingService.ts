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
}

export const onlineBookingService = new OnlineBookingService()