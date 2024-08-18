import BaseAPIService from '@/components/api/BaseAPIService'

class PlanService extends BaseAPIService {
    async getPlans(params: object): Promise<any> {
        return await this.request(`/user/citizen-plans`, 'GET', params)
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
        return await this.request(`/user/citizen-plans/download/report`, 'GET', params)
    }
}

export const planService = new PlanService()