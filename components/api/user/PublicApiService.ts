import BaseAPIService from '@/components/api/BaseAPIService'

class PublicApiService extends BaseAPIService {
    async getStatus(): Promise<any> {
        return await this.request(`/user/public-api-settings`, 'GET')
    }

    async createKey(payload: { name: string, scopes: string[], allowed_ips: string[] }): Promise<any> {
        return await this.request(`/user/public-api-settings/keys`, 'POST', payload)
    }

    async revokeKey(id: string): Promise<any> {
        return await this.request(`/user/public-api-settings/keys/${id}`, 'DELETE')
    }

    async deleteWebhook(id: string): Promise<any> {
        return await this.request(`/user/public-api-settings/webhooks/${id}`, 'DELETE')
    }
}

export const publicApiService = new PublicApiService()
