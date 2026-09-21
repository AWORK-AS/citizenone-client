import BaseAPIService from '@/components/api/BaseAPIService'

class AiUsageService extends BaseAPIService {
    async overview(): Promise<any> {
        return await this.request(`/user/ai/usage`, 'GET')
    }

    async updateAutoReload(params: object): Promise<any> {
        return await this.request(`/user/ai/auto-reload`, 'PUT', params)
    }

    /**
     * How much of a day one person may use. Null clears it, which returns to
     * the share derived from the company's own allowance - not to no limit.
     */
    async updateUserDailyLimit(requestsPerDay: number | null): Promise<any> {
        return await this.request(`/user/ai/user-daily-limit`, 'PUT', { requests_per_day: requestsPerDay })
    }
}

export const aiUsageService = new AiUsageService()
