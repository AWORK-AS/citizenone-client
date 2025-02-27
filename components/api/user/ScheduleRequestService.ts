import BaseAPIService from '@/components/api/user/BaseAPIService'

class ScheduleRequestService extends BaseAPIService {
    async getScheduleRequests(params: object): Promise<any> {
        return await this.request(`/user/schedule-requests`, 'GET', params)
    }

    async saveScheduleRequest(params: object): Promise<any> {
        return await this.request(`/user/schedule-requests`, 'POST', params)
    }

    async approveScheduleRequest(scheduleRequestUuid: any): Promise<any> {
        return await this.request(`/user/schedule-requests/${scheduleRequestUuid}/approve`, 'POST')
    }

    async rejectScheduleRequest(scheduleRequestUuid: any): Promise<any> {
        return await this.request(`/user/schedule-requests/${scheduleRequestUuid}/reject`, 'POST')
    }
}

export const scheduleRequestService = new ScheduleRequestService()