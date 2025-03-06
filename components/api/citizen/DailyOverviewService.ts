import BaseAPIService from '@/components/api/BaseAPIService'

class DailyOverviewService extends BaseAPIService {
    async getSalesCampaigns(): Promise<any> {
        return await this.request(`/user/sales-campaigns`, 'GET')
    }

    async getNews(): Promise<any> {
        return await this.request(`/citizen/news/daily/overview `, 'GET')
    }
}
export const dailyOverviewService = new DailyOverviewService()