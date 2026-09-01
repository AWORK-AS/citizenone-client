import BaseAPIService from '@/components/api/BaseAPIService'

class CompensatoryTimeRequestService extends BaseAPIService {
    async getCompensatoryTimeRequests(params: object): Promise<any> {
        return await this.request(`/user/compensatory-time-requests`, 'GET', params)
    }

    async getCompensatoryTimeRequest(compensatoryTimeRequestUuid: any): Promise<any> {
        return await this.request(`/user/compensatory-time-requests/${compensatoryTimeRequestUuid}`, 'GET')
    }

    async saveCompensatoryTimeRequest(params: object): Promise<any> {
        return await this.request(`/user/compensatory-time-requests`, 'POST', params)
    }

    async approveCompensatoryTimeRequest(compensatoryTimeRequestUuid: any): Promise<any> {
        return await this.request(`/user/compensatory-time-requests/${compensatoryTimeRequestUuid}/approve`, 'POST')
    }

    async declineCompensatoryTimeRequest(compensatoryTimeRequestUuid: any, comment?: string): Promise<any> {
        return await this.request(`/user/compensatory-time-requests/${compensatoryTimeRequestUuid}/decline`, 'POST', { comment })
    }

    async withdrawCompensatoryTimeRequest(compensatoryTimeRequestUuid: any): Promise<any> {
        return await this.request(`/user/compensatory-time-requests/${compensatoryTimeRequestUuid}/withdraw`, 'POST')
    }

    async reverseCompensatoryTimeRequest(compensatoryTimeRequestUuid: any, comment?: string): Promise<any> {
        return await this.request(`/user/compensatory-time-requests/${compensatoryTimeRequestUuid}/reverse`, 'POST', { comment })
    }
}

export const compensatoryTimeRequestService = new CompensatoryTimeRequestService()
