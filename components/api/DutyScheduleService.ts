import BaseAPIService from '@/components/api/BaseAPIService'

class DutyScheduleService extends BaseAPIService {
    async getDutySchedules(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules`, 'GET', params)
    }

    async saveDutySchedule(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules`, 'POST', params)
    }

    async updateDutySchedule(dutyScheduleUuid: any, params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/${dutyScheduleUuid}`, 'PUT', params)
    }

    async deleteDutySchedule(dutyScheduleUuid: any): Promise<any> {
        return await this.request(`/user/duty-schedules/${dutyScheduleUuid}`, 'DELETE')
    }
}

export const dutyScheduleService = new DutyScheduleService()