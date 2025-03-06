import BaseAPIService from '@/components/api/BaseAPIService'

class DutyScheduleService extends BaseAPIService {
    async getDutySchedules(params: object): Promise<any> {
        return await this.request(`/citizen/duty-schedules`, 'GET', params)
    }

    async downloadDutySchedules(params: object): Promise<any> {
        return await this.request(`/citizen/duty-schedules/download/report`, 'GET', params)
    }

    async getDutyScheduleAbsencePercentage(params: object): Promise<any> {
        return await this.request(`/citizen/duty-schedules/show/percentage`, 'GET', params)
    }
}

export const dutyScheduleService = new DutyScheduleService()