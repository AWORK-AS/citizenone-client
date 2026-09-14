import BaseAPIService from '@/components/api/BaseAPIService'

class ShiftRequestService extends BaseAPIService {
    async getShiftRequests(params: object): Promise<any> {
        return await this.request(`/user/shift-requests`, 'GET', params)
    }

    async getShiftRequest(shiftRequestUuid: any): Promise<any> {
        return await this.request(`/user/shift-requests/${shiftRequestUuid}`, 'GET')
    }

    async saveShiftRequest(params: object): Promise<any> {
        return await this.request(`/user/shift-requests`, 'POST', params)
    }

    async deleteShiftRequest(shiftRequestUuid: any): Promise<any> {
        return await this.request(`/user/shift-requests/${shiftRequestUuid}`, 'DELETE')
    }

    async approveShiftRequest(shiftRequestUuid: any): Promise<any> {
        return await this.request(`/user/shift-requests/${shiftRequestUuid}/approve`, 'POST')
    }

    async rejectShiftRequest(shiftRequestUuid: any, comment?: string): Promise<any> {
        return await this.request(`/user/shift-requests/${shiftRequestUuid}/reject`, 'POST', { comment })
    }
}

export const shiftRequestService = new ShiftRequestService()
