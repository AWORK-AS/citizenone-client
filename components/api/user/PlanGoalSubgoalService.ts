import BaseAPIService from '@/components/api/BaseAPIService'

class PlanGoalSubgoalService extends BaseAPIService {
    async getPendingPlansGoalsSubgoals(params: object): Promise<any> {
        return await this.request(`/user/citizens/pending-plans-goals-subgoals/all/list`, 'GET', params)
    }
}
export const planGoalSubgoalService = new PlanGoalSubgoalService()