import BaseAPIService from '@/components/api/BaseAPIService'

class DailyOverviewService extends BaseAPIService {
    async getCitizensAdmissionAndDischarged(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/admitted-discharged`, 'GET', params)
    }

    async getCitizensRiskAssessment(params: object): Promise<any> {
        return await this.request(`/user/citizen-journals/risk-assessments/count`, 'GET', params)
    }

    async getCitizensGender(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/gender-count`, 'GET', params)
    }

    async getCitizensOrigin(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/with-origin`, 'GET', params)
    }

    async getCitizensAddictions(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/with-addictions`, 'GET', params)
    }

    async getCitizensAddictionsCount(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/addiction-count`, 'GET', params)
    }

    async getCitizensDiagnoses(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/with-diagnoses`, 'GET', params)
    }

    async getCitizensDiagnosesCount(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/diagnosis-count`, 'GET', params)
    }

    async getMyDailyEvents(params: object): Promise<any> {
        return await this.request(`/user/my-calendars/daily/events`, 'GET', params)
    }

    async getCitizenDailyEvents(params: object): Promise<any> {
        return await this.request(`/user/my-calendars/citizen/daily/events`, 'GET', params)
    }

    async getLatestCitizensJournal(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/overview`, 'GET', params)
    }

    async getTreatments(params: object): Promise<any> {
        return await this.request(`/user/treatments/daily/overview`, 'GET', params)
    }

    async getCitizensJournalScoreStatistics(params: object): Promise<any> {
        return await this.request(`/user/citizen-journals/score/statistics`, 'GET', params)
    }

    async getCitizenDailyMedicineOverview(params: object): Promise<any> {
        return await this.request(`/user/citizen-medicines/daily/overview`, 'GET', params)
    }

    async getSalesCampaigns(): Promise<any> {
        return await this.request(`/user/sales-campaigns`, 'GET')
    }

    async getGoalsScoreStatistics(params: object): Promise<any> {
        return await this.request(`/user/citizen-goals/score/statistics`, 'GET', params)
    }

    async getSubgoalsScoreStatistics(params: object): Promise<any> {
        return await this.request(`/user/citizen-subgoals/score/statistics`, 'GET', params)
    }

    async getStatusesScoreStatistics(params: object): Promise<any> {
        return await this.request(`/user/statuses/score/statistics`, 'GET', params)
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

    async getScheduleSlots(params: object): Promise<any> {
        return await this.request(`/user/schedule-slots`, 'GET', params)
    }

    async getCitizenPlansAndGoals(params: object): Promise<any> {
        return await this.request(`/user/citizen-plans/goals-and-sub-goals/all`, 'GET', params)
    }

    async getNews(): Promise<any> {
        return await this.request(`/user/news/daily/overview`, 'GET')
    }

    async getPolls(): Promise<any> {
        return await this.request(`/user/polls`, 'GET')
    }

    async updateDailyOverviewFilter(params: object): Promise<any> {
        return await this.request(`/user/daily-overview-filter`, 'PUT', params)
    }

    async updateViewAllFilter(params: object): Promise<any> {
        return await this.request(`/user/view-all-filter`, 'PUT', params)
    }

    async updateDateFilter(params: object): Promise<any> {
        return await this.request(`/user/employees/set/daily-overview/dates`, 'PUT', params)
    }

    async saveVote(params: object): Promise<any> {
        return await this.request(`/user/poll-votes`, 'POST', params)
    }

    async deleteVote(pollItemUuid: string): Promise<any> {
        return await this.request(`/user/poll-votes/${pollItemUuid}`, 'DELETE')
    }
}

export const dailyOverviewService = new DailyOverviewService()