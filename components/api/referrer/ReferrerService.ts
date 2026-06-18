import BaseAPIService from '@/components/api/BaseAPIService'

class ReferrerService extends BaseAPIService {
    async getCurrentLoggedInReferrer(): Promise<any> {
        return await this.request(`/referrer`, 'GET')
    }

    async updateReferrerLanguage(params: object): Promise<any> {
        return await this.request(`/referrer/update/language`, 'PUT', params)
    }
}

export const referrerService = new ReferrerService()
