import BaseAPIService from '@/components/api/BaseAPIService'

class ShiftSwapRequestService extends BaseAPIService {
    async getScheduleSwapRequests(params: object): Promise<any> {
        return await this.request(`/user/shift-swap-requests`, 'GET', params)
    }

    async saveScheduleSwapRequest(params: object): Promise<any> {
        return await this.request(`/user/shift-swap-requests`, 'POST', params)
    }

    async approveScheduleSwapRequest(shiftSwapRequestUuid: any): Promise<any> {
        return await this.request(`/user/shift-swap-requests/${shiftSwapRequestUuid}/approve`, 'POST')
    }

    async rejectScheduleSwapRequest(shiftSwapRequestUuid: any): Promise<any> {
        return await this.request(`/user/shift-swap-requests/${shiftSwapRequestUuid}/reject`, 'DELETE')
    }

    async getAllAvailableUsers(params: object = {}): Promise<any> {
        return await this.request(`/user/employees/all/no-all-employees-current-user`, 'GET', params)
    }
}

export const shiftSwapRequestService = new ShiftSwapRequestService()