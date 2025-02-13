import BaseAPIService from '@/components/api/BaseAPIService'

class AudienceService extends BaseAPIService {
    async getAllAudiences(): Promise<any> {
        return await this.request(`/user/audiences/all/list`, 'GET')
    }
}

export const audienceService = new AudienceService()