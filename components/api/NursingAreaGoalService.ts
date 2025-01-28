import BaseAPIService from '@/components/api/BaseAPIService'

class NursingAreaGoalService extends BaseAPIService {
    async getNursingAreaGoals(params: object): Promise<any> {
        return await this.request(`/user/nursing-area-goals`, 'GET', params)
    }

    async saveNursingAreaGoal(params: object): Promise<any> {
        return await this.request(`/user/nursing-area-goals`, 'POST', params)
    }

    async updateNursingAreaGoal(nursingAreaGoalUuid: any, params: object): Promise<any> {
        return await this.request(`/user/nursing-area-goals/${nursingAreaGoalUuid}`, 'PUT', params)
    }

    async deleteNursingAreaGoal(nursingAreaGoalUuid: any): Promise<any> {
        return await this.request(`/user/nursing-area-goals/${nursingAreaGoalUuid}`, 'DELETE')
    }
}

export const nursingAreaGoalService = new NursingAreaGoalService()