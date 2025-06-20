import BaseAPIService from '@/components/api/BaseAPIService'

class CoursesEventsService extends BaseAPIService {
    async getCoursesEvents(params: any): Promise<any> {
        return await this.request(`/user/courses-events`, 'GET', params)
    }

    async getEventCourse(bookingUuid: any): Promise<any> {
        return await this.request(`/user/courses-events/${bookingUuid}`, 'GET')
    }

    async saveEventCourse(params: object): Promise<any> {
        return await this.request(`/user/courses-events`, 'POST', params)
    }

    async updateEventCourse(bookingUuid: any, params: object): Promise<any> {
        return await this.request(`/user/courses-events/${bookingUuid}/update`, 'POST', params)
    }

    async deleteEventCourse(bookingUuid: any): Promise<any> {
        return await this.request(`/user/courses-events/${bookingUuid}`, 'DELETE')
    }
}

export const coursesEventsService = new CoursesEventsService()