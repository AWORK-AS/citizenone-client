import BaseAPIService from '@/components/api/BaseAPIService'

class ScheduleService extends BaseAPIService {
    async getSchedules(): Promise<any> {
        return await this.request(`/user/schedules`, 'GET')
    }

    async saveSchedule(params: object): Promise<any> {
        return await this.request(`/user/schedules`, 'POST', params)
    }

    async updateSchedule(scheduleUuid: any, params: object): Promise<any> {
        return await this.request(`/user/schedules/${scheduleUuid}`, 'PUT', params)
    }
}

export const scheduleService = new ScheduleService()