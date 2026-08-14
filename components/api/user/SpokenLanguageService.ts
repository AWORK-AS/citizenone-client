import BaseAPIService from '@/components/api/BaseAPIService'

class SpokenLanguageService extends BaseAPIService {
    async getSpokenLanguages(): Promise<any> {
        return await this.request(`/user/spoken-languages`, 'GET')
    }
}

export const spokenLanguageService = new SpokenLanguageService()
