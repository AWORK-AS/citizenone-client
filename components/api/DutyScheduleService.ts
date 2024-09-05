import BaseAPIService from '@/components/api/BaseAPIService'

class DutyScheduleService extends BaseAPIService {
    async getDutySchedules(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules`, 'GET', params)
    }

    async saveDutySchedule(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules`, 'POST', params)
    }

    async updateDutySchedule(scheduleUuid: any, params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/${scheduleUuid}`, 'PUT', params)
    }

    async deleteDutySchedule(scheduleUuid: any): Promise<any> {
        return await this.request(`/user/duty-schedules/${scheduleUuid}`, 'DELETE')
    }
}

export const dutyScheduleService = new DutyScheduleService()