import BaseAPIService from '@/components/api/BaseAPIService'

class NormPeriodService extends BaseAPIService {
    async getNormPeriods(params: object): Promise<any> {
        return await this.request(`/user/norm-periods`, 'GET', params)
    }

    async getNormPeriod(normPeriodUuid: any): Promise<any> {
        return await this.request(`/user/norm-periods/${normPeriodUuid}`, 'GET')
    }

    async saveNormPeriod(params: object): Promise<any> {
        return await this.request(`/user/norm-periods`, 'POST', params)
    }

    async updateNormPeriod(normPeriodUuid: any, params: object): Promise<any> {
        return await this.request(`/user/norm-periods/${normPeriodUuid}`, 'PUT', params)
    }

    async deleteNormPeriod(normPeriodUuid: any): Promise<any> {
        return await this.request(`/user/norm-periods/${normPeriodUuid}`, 'DELETE')
    }

    async getAllNormPeriods(): Promise<any> {
        return await this.request(`/user/norm-periods/all/list`, 'GET')
    }

    async assignUsers(normPeriodUuid: string, params: object): Promise<any> {
        return await this.request(`/user/norm-periods/${normPeriodUuid}/assign-users`, 'POST', params)
    } 
}

export const normPeriodService = new NormPeriodService()