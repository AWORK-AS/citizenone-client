import BaseAPIService from '@/components/api/BaseAPIService'

class AdminConsentService extends BaseAPIService {
    async callback(params: object): Promise<any> {
        return await this.request(`/entra/admin-consent/call-back`, 'POST', params)
    }
}

export const adminConsentService = new AdminConsentService()