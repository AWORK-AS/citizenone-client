import BaseAPIService from '@/components/api/BaseAPIService'

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

    async deleteScheduleRequest(scheduleRequestUuid: any): Promise<any> {
        return await this.request(`/user/schedule-requests/${scheduleRequestUuid}`, 'DELETE')
    }
}

export const scheduleRequestService = new ScheduleRequestService()