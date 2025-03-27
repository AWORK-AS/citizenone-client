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

    async toggleSubgoalCompletionDate(subgoalUuid: any): Promise<any> {
        return await this.request(`/user/citizen-subgoals/${subgoalUuid}/toggle-date-complete`, 'PUT')
    }

    async deleteSubgoal(subgoalUuid: any): Promise<any> {
        return await this.request(`/user/citizen-subgoals/${subgoalUuid}`, 'DELETE')
    }

    async archiveUnarchiveSubgoal(subgoalUuid: any): Promise<any> {
        return await this.request(`/user/citizen-subgoals/${subgoalUuid}/toggle-archive`, 'PUT')
    }

    async getArchiveSubgoals(params: object): Promise<any> {
        return await this.request(`/user/citizen-subgoals/archived/list`, 'GET', params)
    }

    async getAllSubgoals(goalUuid: any): Promise<any> {
        return await this.request(`/user/citizen-subgoals/${goalUuid}/all/list`, 'GET')
    }
}

export const subgoalService = new SubgoalService()