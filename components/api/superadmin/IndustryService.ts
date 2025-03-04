import BaseAPIService from '@/components/api/user/BaseAPIService'

class IndustryService extends BaseAPIService {
    async getAllIndustries(): Promise<any> {
        return await this.request(`/superadmin/industries/all/list`, 'GET')
    }
}

export const industryService = new IndustryService()