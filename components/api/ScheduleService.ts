import BaseAPIService from '@/components/api/BaseAPIService'

class ScheduleService extends BaseAPIService {
    async getSchedules(): Promise<any> {
        return await this.request(`/user/my-calendars`, 'GET')
    }

    async saveSchedule(params: object): Promise<any> {
        return await this.request(`/user/my-calendars`, 'POST', params)
    }

    async updateSchedule(scheduleUuid: any, params: object): Promise<any> {
        return await this.request(`/user/my-calendars/${scheduleUuid}`, 'PUT', params)
    }
}

export const scheduleService = new ScheduleService()