import BaseAPIService from '@/components/api/BaseAPIService'

class DutyScheduleService extends BaseAPIService {
    async saveDutySchedule(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules`, 'POST', params)
    }
}

export const dutyScheduleService = new DutyScheduleService()