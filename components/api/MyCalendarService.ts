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

    async downloadCalendar(): Promise<any> {
        return await this.request(`/user/my-calendars/download/calendar`, 'GET')
    }
}

export const myCalendarService = new MyCalendarService()