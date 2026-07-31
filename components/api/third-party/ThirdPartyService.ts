import BaseAPIService from '@/components/api/BaseAPIService'

class ThirdPartyService extends BaseAPIService {
    async getCurrentLoggedInThirdParty(): Promise<any> {
        return await this.request(`/third-party`, 'GET')
    }

    async updateThirdPartyLanguage(params: object): Promise<any> {
        return await this.request(`/third-party/update/language`, 'PUT', params)
    }
}

export const thirdPartyService = new ThirdPartyService()
