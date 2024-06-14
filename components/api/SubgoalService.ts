import BaseAPIService from '@/components/api/BaseAPIService'

class SubgoalService extends BaseAPIService {
    async getSubgoals(params: object): Promise<any> {
        return await this.request(`/user/citizen-subgoals`, 'GET', params)
    }

    async saveSubgoal(params: object): Promise<any> {
        return await this.request(`/user/citizen-subgoals`, 'POST', params)
    }

    async updateSubgoal(subgoalUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-subgoals/${subgoalUuid}`, 'PUT', params)
    }

    async deleteSubgoal(subgoalUuid: any): Promise<any> {
        return await this.request(`/user/citizen-subgoals/${subgoalUuid}`, 'DELETE')
    }
}

export const subgoalService = new SubgoalService()