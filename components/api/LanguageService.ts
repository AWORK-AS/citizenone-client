import BaseAPIService from '@/components/api/BaseAPIService'

class LanguageService extends BaseAPIService {
    async getLanguages(): Promise<any> {
        return await this.request(`/user/languages`, 'GET')
    }
}

export const languageService = new LanguageService()