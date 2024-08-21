import BaseAPIService from '@/components/api/BaseAPIService'

class StatusService extends BaseAPIService {
    async getStatuses(params: object): Promise<any> {
        return await this.request(`/user/statuses`, 'GET', params)
    }

    async saveStatus(params: object): Promise<any> {
        return await this.request(`/user/statuses`, 'POST', params)
    }

    async updateStatus(statusUuid: any, params: object): Promise<any> {
        return await this.request(`/user/statuses/${statusUuid}`, 'PUT', params)
    }

    async deleteStatus(statusUuid: any): Promise<any> {
        return await this.request(`/user/statuses/${statusUuid}`, 'DELETE')
    }
}

export const statusService = new StatusService()