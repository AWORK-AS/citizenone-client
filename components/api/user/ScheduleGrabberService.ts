import BaseAPIService from '@/components/api/user/BaseAPIService'

class ScheduleGrabberService extends BaseAPIService {
    async requestScheduleSlot(params: object): Promise<any> {
        return await this.request(`/user/schedule-grabbers`, 'POST', params)
    }

    async approveRequest(params: object): Promise<any> {
        return await this.request(`/user/schedule-grabbers/approve/request`, 'POST', params)
    }

    async disapproveRequest(params: object): Promise<any> {
        return await this.request(`/user/schedule-grabbers/disapprove/request`, 'POST', params)
    }
}

export const scheduleGrabberService = new ScheduleGrabberService()