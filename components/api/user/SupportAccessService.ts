import BaseAPIService from '@/components/api/BaseAPIService'

/**
 * Kundens side: godkend, afvis, træk tilbage, og se hvem der har været inde.
 */
class SupportAccessService extends BaseAPIService {
    async getRequests(params: object = {}): Promise<any> {
        return await this.request('/support-access/requests', 'GET', params)
    }

    async decide(uuid: string, params: object): Promise<any> {
        return await this.request(`/support-access/requests/${uuid}`, 'PUT', params)
    }

    async revoke(uuid: string): Promise<any> {
        return await this.request(`/support-access/requests/${uuid}`, 'DELETE')
    }

    async getHistory(params: object = {}): Promise<any> {
        return await this.request('/support-access/history', 'GET', params)
    }
}

export const supportAccessService = new SupportAccessService()
