import BaseAPIService from '@/components/api/BaseAPIService'

class IndustryService extends BaseAPIService {
    async getAllIndustries(): Promise<any> {
        return await this.request(`/industries`, 'GET')
    }
}

export const industryService = new IndustryService()