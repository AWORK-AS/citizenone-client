import BaseAPIService from '@/components/api/BaseAPIService'

class PlanGoalSubgoalService extends BaseAPIService {
    async getPendingPlansGoalsSubgoals(params: object): Promise<any> {
        return await this.request(`/user/citizens/pending-plans-goals-subgoals/all/list`, 'GET', params)
    }

    async getPlanGoalSubgoalGraph(modelUuid: object): Promise<any> {
        return await this.request(`/user/citizen-plans/${modelUuid}/statistics-graph`, 'GET')
    }
}
export const planGoalSubgoalService = new PlanGoalSubgoalService()