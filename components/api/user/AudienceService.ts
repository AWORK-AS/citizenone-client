import BaseAPIService from '@/components/api/user/BaseAPIService'

class AudienceService extends BaseAPIService {
    async getAllAudiences(): Promise<any> {
        return await this.request(`/user/audiences/all/list`, 'GET')
    }
}

export const audienceService = new AudienceService()