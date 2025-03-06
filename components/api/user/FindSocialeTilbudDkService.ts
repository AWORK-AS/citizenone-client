import BaseAPIService from '@/components/api/BaseAPIService'

class FindSocialeTilbudDkService extends BaseAPIService {
    async sendManageCompany(params: object): Promise<any> {
        return await this.request(`/user/findsocialetilbuddk/manage-company/send-message`, 'POST', params)
    }

    async sendShowInterest(params: object): Promise<any> {
        return await this.request(`/user/findsocialetilbuddk/interest/send-message`, 'POST', params)
    }
}

export const findSocialeTilbudDkService = new FindSocialeTilbudDkService()