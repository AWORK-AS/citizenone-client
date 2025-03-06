import BaseAPIService from '@/components/api/BaseAPIService'

class PlanService extends BaseAPIService {
    async getPlans(params: object): Promise<any> {
        return await this.request(`/user/citizen-plans`, 'GET', params)
    }

    async getJournalPlanList(params: object): Promise<any> {
        return await this.request(`/user/citizen-plans/journal/plan/list`, 'GET', params)
    }

    async savePlan(params: object): Promise<any> {
        return await this.request(`/user/citizen-plans`, 'POST', params)
    }

    async updatePlan(planUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-plans/${planUuid}`, 'PUT', params)
    }

    async deletePlan(planUuid: any): Promise<any> {
        return await this.request(`/user/citizen-plans/${planUuid}`, 'DELETE')
    }

    async archiveUnarchivePlan(planUuid: any): Promise<any> {
        return await this.request(`/user/citizen-plans/${planUuid}/toggle-archive`, 'PUT')
    }

    async getArchivePlans(params: object): Promise<any> {
        return await this.request(`/user/citizen-plans/archived/list`, 'GET', params)
    }

    async downloadPlansAndGoals(params: object): Promise<any> {
        return await this.request(`/user/citizen-plans/download/reports`, 'GET', params)
    }

    async getAllPlans(citizenUuid: any): Promise<any> {
        return await this.request(`/user/citizen-plans/${citizenUuid}/all/list`, 'GET')
    }
}

export const planService = new PlanService()