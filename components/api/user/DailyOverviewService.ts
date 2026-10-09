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

    /**
     * What needs attention on this shift. Computed server-side, one prioritised
     * list, so the page does not have to assemble it from five endpoints.
     */
    async getDailyBrief(): Promise<any> {
        return await this.request(`/user/daily-brief`, 'GET')
    }

    async getUpcomingBirthdays(params: object = {}): Promise<any> {
        return await this.request(`/user/citizens/all/upcoming-birthdays`, 'GET', params)
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
        return await this.request(`/user/daily-overview/schedule-slots`, 'GET', params)
    }

    /** The signed-in user's next working shift, or `data: null` when none is planned. */
    async getNextShift(): Promise<any> {
        return await this.request(`/user/daily-overview/next-shift`, 'GET')
    }

    /** Who is on duty on `date` (default today), for the `department` name or the whole company when blank. */
    async getOnDuty(params: { date?: string; department?: string }): Promise<any> {
        return await this.request(`/user/daily-overview/on-duty`, 'GET', params)
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

    /**
     * The admin-set layout this user gets: their selected department's, else the
     * company default. `data` is null when no admin has set one up.
     */
    async getLayout(): Promise<any> {
        return await this.request(`/user/daily-overview/layout`, 'GET')
    }

    async getLayouts(): Promise<any> {
        return await this.request(`/user/daily-overview/layouts`, 'GET')
    }

    /** One scope for the admin page. No department_uuid means the company default. */
    async getLayoutScope(params: object): Promise<any> {
        return await this.request(`/user/daily-overview/layouts/scope`, 'GET', params)
    }

    async saveLayoutScope(params: object): Promise<any> {
        return await this.request(`/user/daily-overview/layouts/scope`, 'PUT', params)
    }

    async deleteLayoutScope(params: object): Promise<any> {
        return await this.request(`/user/daily-overview/layouts/scope`, 'DELETE', params)
    }

    async getCustomBoxes(): Promise<any> {
        return await this.request(`/user/daily-overview/custom-boxes`, 'GET')
    }

    async saveCustomBox(params: object): Promise<any> {
        return await this.request(`/user/daily-overview/custom-boxes`, 'POST', params)
    }

    async updateCustomBox(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/daily-overview/custom-boxes/${uuid}`, 'PUT', params)
    }

    async deleteCustomBox(uuid: string): Promise<any> {
        return await this.request(`/user/daily-overview/custom-boxes/${uuid}`, 'DELETE')
    }

    async getCustomBoxData(uuid: string): Promise<any> {
        return await this.request(`/user/daily-overview/custom-boxes/${uuid}/data`, 'GET')
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