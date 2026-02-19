import BaseAPIService from '@/components/api/BaseAPIService'

class DutyScheduleService extends BaseAPIService {
    async unlockDutySchedule(sharedDutyScheduleUuid: any, params: object): Promise<any> {
        return await this.request(`/guest/share/${sharedDutyScheduleUuid}/unlock`, 'POST', params)
    }
}

export const dutyScheduleService = new DutyScheduleService()