import BaseAPIService from '@/components/api/BaseAPIService'

class AiUsageService extends BaseAPIService {
    async overview(): Promise<any> {
        return await this.request(`/user/ai/usage`, 'GET')
    }

    async updateAutoReload(params: object): Promise<any> {
        return await this.request(`/user/ai/auto-reload`, 'PUT', params)
    }
}

export const aiUsageService = new AiUsageService()
