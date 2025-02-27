import BaseAPIService from '@/components/api/user/BaseAPIService'

class LanguageService extends BaseAPIService {
    async getAllLanguages(): Promise<any> {
        return await this.request(`/languages`, 'GET')
    }
}

export const languageService = new LanguageService()