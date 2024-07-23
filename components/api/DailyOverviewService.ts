import BaseAPIService from '@/components/api/BaseAPIService'

class DailyOverviewService extends BaseAPIService {
    async getLatestCitizensJournal(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/overview`, 'GET', params)
    }

    async getSalesCampaigns(): Promise<any> {
        return await this.request(`/user/sales-campaigns`, 'GET')
    }

    async getNews(): Promise<any> {
        return await this.request(`/user/news`, 'GET')
    }

    async getPolls(): Promise<any> {
        return await this.request(`/user/polls`, 'GET')
    }
}

export const dailyOverviewService = new DailyOverviewService()