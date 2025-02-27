import BaseAPIService from '@/components/api/user/BaseAPIService'

class GoalService extends BaseAPIService {
    async getGoals(params: object): Promise<any> {
        return await this.request(`/user/citizen-goals`, 'GET', params)
    }

    async saveGoal(params: object): Promise<any> {
        return await this.request(`/user/citizen-goals`, 'POST', params)
    }

    async updateGoal(goalUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-goals/${goalUuid}`, 'PUT', params)
    }

    async deleteGoal(goalUuid: any): Promise<any> {
        return await this.request(`/user/citizen-goals/${goalUuid}`, 'DELETE')
    }

    async getAllGoals(planUuid: any): Promise<any> {
        return await this.request(`/user/citizen-goals/${planUuid}/all/list`, 'GET')
    }
}

export const goalService = new GoalService()