import BaseAPIService from '@/components/api/BaseAPIService'

class SocialWelfareService extends BaseAPIService {
    // Revenue split across primary/secondary case workers (coordinators)
    async getCoordinatorEconomy(params: object): Promise<any> {
        return await this.request(`/user/social-welfare/coordinator-economy`, 'GET', params)
    }
}

export const socialWelfareService = new SocialWelfareService()
