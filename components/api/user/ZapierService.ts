import BaseAPIService from '@/components/api/BaseAPIService'

class ZapierService extends BaseAPIService {
    async getStatus(): Promise<any> {
        return await this.request(`/user/zapier-settings`, 'GET')
    }

    async updateSettings(includeFreeText: boolean): Promise<any> {
        return await this.request(`/user/zapier-settings`, 'PUT', { include_free_text: includeFreeText })
    }

    async createKey(name: string): Promise<any> {
        return await this.request(`/user/zapier-settings/keys`, 'POST', { name })
    }

    async revokeKey(id: string): Promise<any> {
        return await this.request(`/user/zapier-settings/keys/${id}`, 'DELETE')
    }
}

export const zapierService = new ZapierService()
