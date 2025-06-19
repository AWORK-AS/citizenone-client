import BaseAPIService from '@/components/api/BaseAPIService'

class BookCoursesEventsService extends BaseAPIService {
    async getCoursesEvents(): Promise<any> {
        return await this.request(`/user/book-courses-events`, 'GET')
    }

    async getEventCourse(bookingUuid: any): Promise<any> {
        return await this.request(`/user/book-courses-events/${bookingUuid}`, 'GET')
    }

    async saveEventCourse(params: object): Promise<any> {
        return await this.request(`/user/book-courses-events`, 'POST', params)
    }

    async updateEventCourse(bookingUuid: any, params: object): Promise<any> {
        return await this.request(`/user/book-courses-events/${bookingUuid}/update`, 'POST', params)
    }

    async deleteEventCourse(bookingUuid: any): Promise<any> {
        return await this.request(`/user/book-courses-events/${bookingUuid}`, 'DELETE')
    }
}

export const bookCoursesEventsService = new BookCoursesEventsService()