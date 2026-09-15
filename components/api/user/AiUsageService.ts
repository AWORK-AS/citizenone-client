import BaseAPIService from '@/components/api/BaseAPIService'

class AiUsageService extends BaseAPIService {
    async overview(): Promise<any> {
        return await this.request(`/user/ai/usage`, 'GET')
    }
}

export const aiUsageService = new AiUsageService()
