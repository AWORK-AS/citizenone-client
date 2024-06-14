import BaseAPIService from '@/components/api/BaseAPIService'

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
}

export const goalService = new GoalService()