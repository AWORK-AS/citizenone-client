import BaseAPIService from '@/components/api/BaseAPIService'

class CoursesEventsService extends BaseAPIService {
    async getCoursesEvents(params: any): Promise<any> {
        return await this.request(`/user/courses-events`, 'GET', params)
    }

    async getEventCourse(eventCourseUuid: any): Promise<any> {
        return await this.request(`/user/courses-events/${eventCourseUuid}`, 'GET')
    }

    async getEventCourseParticipants(eventCourseUuid: any, params: any): Promise<any> {
        return await this.request(`/user/courses-events/${eventCourseUuid}/participants`, 'GET', params)
    }

    async saveEventCourse(params: object): Promise<any> {
        return await this.request(`/user/courses-events`, 'POST', params)
    }

    async updateEventCourse(eventCourseUuid: any, params: object): Promise<any> {
        return await this.request(`/user/courses-events/${eventCourseUuid}/update`, 'POST', params)
    }

    async deleteEventCourse(eventCourseUuid: any): Promise<any> {
        return await this.request(`/user/courses-events/${eventCourseUuid}`, 'DELETE')
    }
}

export const coursesEventsService = new CoursesEventsService()