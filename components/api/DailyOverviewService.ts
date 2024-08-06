import BaseAPIService from '@/components/api/BaseAPIService'

class DailyOverviewService extends BaseAPIService {
    async getDailyEvents(): Promise<any> {
        return await this.request(`/user/my-calendars/daily/events`, 'GET')
    }

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

    async saveVote(params: object): Promise<any> {
        return await this.request(`/user/poll-votes`, 'POST', params)
    }

    async deleteVote(pollItemUuid: string): Promise<any> {
        return await this.request(`/user/poll-votes/${pollItemUuid}`, 'DELETE')
    }
}

export const dailyOverviewService = new DailyOverviewService()