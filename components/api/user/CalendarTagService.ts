import BaseAPIService from '@/components/api/BaseAPIService'

class CalendarTagService extends BaseAPIService {
    async getCalendarTags(params: object): Promise<any> {
        return await this.request(`/user/calendar-tags`, 'GET', params)
    }

    async getCalendarTag(calendarTagUuid: any): Promise<any> {
        return await this.request(`/user/calendar-tags/${calendarTagUuid}`, 'GET')
    }

    async saveCalendarTag(params: object): Promise<any> {
        return await this.request(`/user/calendar-tags`, 'POST', params)
    }

    async updateCalendarTag(calendarTagUuid: any, params: object): Promise<any> {
        return await this.request(`/user/calendar-tags/${calendarTagUuid}`, 'PUT', params)
    }

    async deleteCalendarTag(calendarTagUuid: any): Promise<any> {
        return await this.request(`/user/calendar-tags/${calendarTagUuid}`, 'DELETE')
    }

    async getAllCalendarTags(): Promise<any> {
        return await this.request(`/user/calendar-tags/all/list`, 'GET')
    }
}

export const calendarTagService = new CalendarTagService()