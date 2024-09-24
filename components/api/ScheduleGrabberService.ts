import BaseAPIService from '@/components/api/BaseAPIService'

class ScheduleGrabberService extends BaseAPIService {
    async requestScheduleSlot(params: object): Promise<any> {
        return await this.request(`/user/schedule-grabbers`, 'POST', params)
    }
}

export const scheduleGrabberService = new ScheduleGrabberService()