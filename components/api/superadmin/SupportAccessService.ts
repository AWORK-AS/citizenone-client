import BaseAPIService from '@/components/api/BaseAPIService'

/**
 * Vores side af bank-på-adgangen: spørg kunden om lov, og se hvad de har svaret.
 */
class SupportAccessService extends BaseAPIService {
    async getRequests(params: object = {}): Promise<any> {
        return await this.request('/superadmin/support-access-requests', 'GET', params)
    }

    async requestAccess(params: object): Promise<any> {
        return await this.request('/superadmin/support-access-requests', 'POST', params)
    }
}

export const supportAccessService = new SupportAccessService()
