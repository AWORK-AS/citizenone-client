import BaseAPIService from '@/components/api/BaseAPIService'

class MyCalendarService extends BaseAPIService {
    async getSchedules(params: object): Promise<any> {
        return await this.request(`/user/my-calendars`, 'GET', params)
    }

    async saveSchedule(params: object): Promise<any> {
        return await this.request(`/user/my-calendars`, 'POST', params)
    }

    async updateSchedule(scheduleUuid: any, params: object): Promise<any> {
        return await this.request(`/user/my-calendars/${scheduleUuid}`, 'PUT', params)
    }

    async deleteSchedule(scheduleUuid: any, params: object): Promise<any> {
        return await this.request(`/user/my-calendars/${scheduleUuid}`, 'DELETE', params)
    }

    async downloadCalendar(): Promise<any> {
        return await this.request(`/user/my-calendars/download/calendar`, 'GET')
    }

    async getIcalToken(): Promise<any> {
        return await this.request(`/user/my-calendars/ical/fetch/token`, 'GET')
    }

    async refreshIcalToken(): Promise<any> {
        return await this.request(`/user/my-calendars/ical/token/refresh`, 'POST')
    }

    async updateEventStatus(scheduleUuid: string, params: object): Promise<any> {
        return await this.request(`/user/my-calendars/${scheduleUuid}/status`, 'PUT', params)
    }

    async createJournalFromEvent(scheduleUuid: string, params: object): Promise<any> {
        return await this.request(`/user/my-calendars/${scheduleUuid}/journal`, 'POST', params)
    }

    async getCompletionStatistics(params: object): Promise<any> {
        return await this.request(`/user/my-calendars/completion/statistics`, 'GET', params)
    }
}

export const myCalendarService = new MyCalendarService()