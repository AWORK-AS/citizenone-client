import BaseAPIService from '@/components/api/BaseAPIService'

class IndustryService extends BaseAPIService {
    async getAllIndustries(): Promise<any> {
        return await this.request(`/superadmin/industries/all/list`, 'GET')
    }
}

export const industryService = new IndustryService()