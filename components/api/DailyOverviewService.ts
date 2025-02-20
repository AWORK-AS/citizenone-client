import BaseAPIService from '@/components/api/BaseAPIService'

class DailyOverviewService extends BaseAPIService {
    async getCitizensAdmissionAndDischarged(): Promise<any> {
        return await this.request(`/user/citizens/all/admitted-discharged`, 'GET')
    }

    async getCitizensRiskAssessment(): Promise<any> {
        return await this.request(`user/citizen-journals/risk-assessments/count`, 'GET')
    }

    async getCitizensGender(): Promise<any> {
        return await this.request(`user/citizens/all/gender-count`, 'GET')
    }

    async getCitizensOrigin(): Promise<any> {
        return await this.request(`user/citizens/all/with-origin`, 'GET')
    }

    async getCitizensAddictions(): Promise<any> {
        return await this.request(`user/citizens/all/with-addictions`, 'GET')
    }

    async getCitizensDiagnoses(): Promise<any> {
        return await this.request(`user/citizens/all/with-diagnoses`, 'GET')
    }

    async getCitizensAddiction(): Promise<any> {
        return await this.request(`user/citizens/all/with-addictions`, 'GET')
    }

    async getMyDailyEvents(): Promise<any> {
        return await this.request(`/user/my-calendars/daily/events`, 'GET')
    }

    async getCitizenDailyEvents(params: object): Promise<any> {
        return await this.request(`/user/my-calendars/citizen/daily/events`, 'GET', params)
    }

    async getLatestCitizensJournal(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/overview`, 'GET', params)
    }

    async getCitizensJournalScoreStatistics(): Promise<any> {
        return await this.request(`/user/citizen-journals/score/statistics`, 'GET')
    }

    async getCitizenDailyMedicineOverview(params: object): Promise<any> {
        return await this.request(`/user/citizen-medicines/daily/overview`, 'GET', params)
    }

    async getSalesCampaigns(): Promise<any> {
        return await this.request(`/user/sales-campaigns`, 'GET')
    }

    async getGoalsScoreStatistics(): Promise<any> {
        return await this.request(`/user/citizen-goals/score/statistics`, 'GET')
    }

    async getSubgoalsScoreStatistics(): Promise<any> {
        return await this.request(`/user/citizen-goals/score/statistics`, 'GET')
    }

    async getStatusesScoreStatistics(): Promise<any> {
        return await this.request(`/user/statuses/score/statistics`, 'GET')
    }
    
    async getIncidentsStatistics(params: object): Promise<any> {
        return await this.request(`/user/citizen-incidents-statistics/score/statistics`, 'GET', params)
    }

    async getUseForceStatistics(params: object): Promise<any> {
        return await this.request(`/user/use-of-force-statistics/score/statistics`, 'GET', params)
    }

    async getMedicineDeviationStatistics(params: object): Promise<any> {
        return await this.request(`/user/citizen-medicine-statistics/score/statistics`, 'GET', params)
    }

    async getNews(): Promise<any> {
        return await this.request(`/user/news/daily/overview `, 'GET')
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