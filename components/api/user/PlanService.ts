import BaseAPIService from '@/components/api/user/BaseAPIService'

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

    async downloadPlansAndGoals(params: object): Promise<any> {
        return await this.request(`/user/citizen-plans/download/reports`, 'GET', params)
    }

    async getAllPlans(citizenUuid: any): Promise<any> {
        return await this.request(`/user/citizen-plans/${citizenUuid}/all/list`, 'GET')
    }
}

export const planService = new PlanService()