import BaseAPIService from '@/components/api/user/BaseAPIService'

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

    async downloadDutySchedules(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/download/report`, 'GET', params)
    }

    async getDutyScheduleAbsencePercentage(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/show/percentage`, 'GET', params)
    }

    async copyWeeklyDutySchedule(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/weekly/copy`, 'POST', params)
    }
}

export const dutyScheduleService = new DutyScheduleService()