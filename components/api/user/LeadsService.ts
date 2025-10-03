import BaseAPIService from '@/components/api/BaseAPIService'

class LeadsService extends BaseAPIService {
    async getLeads(params: object): Promise<any> {
        return await this.request(`/user/web-leads`, 'GET', params)
    }
}

export const leadsService = new LeadsService()