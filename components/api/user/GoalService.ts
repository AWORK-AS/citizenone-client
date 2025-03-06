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

    async archiveUnarchiveGoal(goalUuid: any): Promise<any> {
        return await this.request(`/user/citizen-goals/${goalUuid}/toggle-archive`, 'PUT')
    }

    async getArchiveGoals(params: object): Promise<any> {
        return await this.request(`/user/citizen-goals/archived/list`, 'GET', params)
    }

    async archiveGoal(goalUuid: any): Promise<any> {
        return await this.request(`/user/citizen-goals/${goalUuid}/toggle-archive`, 'PUT')
    }

    async getAllGoals(planUuid: any): Promise<any> {
        return await this.request(`/user/citizen-goals/${planUuid}/all/list`, 'GET')
    }
}

export const goalService = new GoalService()