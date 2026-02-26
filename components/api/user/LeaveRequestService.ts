import BaseAPIService from '@/components/api/BaseAPIService'

class LeaveRequestService extends BaseAPIService {
    async getLeaveRequests(params: object): Promise<any> {
        return await this.request(`/user/schedule-leave-requests`, 'GET', params)
    }

    async getLeaveRequest(leaveRequestUuid: any): Promise<any> {
        return await this.request(`/user/schedule-leave-requests/${leaveRequestUuid}`, 'GET')
    }

    async saveLeaveRequest(params: object): Promise<any> {
        return await this.request(`/user/schedule-leave-requests`, 'POST', params)
    }

    async updateLeaveRequest(leaveRequestUuid: any, params: object): Promise<any> {
        return await this.request(`/user/schedule-leave-requests/${leaveRequestUuid}`, 'PUT', params)
    }

    async deleteLeaveRequest(leaveRequestUuid: any): Promise<any> {
        return await this.request(`/user/schedule-leave-requests/${leaveRequestUuid}`, 'DELETE')
    }

    async approveLeaveRequest(leaveRequestUuid: any): Promise<any> {
        return await this.request(`/user/schedule-leave-requests/${leaveRequestUuid}/approve`, 'POST')
    }

    async rejectLeaveRequest(leaveRequestUuid: any): Promise<any> {
        return await this.request(`/user/schedule-leave-requests/${leaveRequestUuid}/reject`, 'POST')
    }
}

export const leaveRequestService = new LeaveRequestService()