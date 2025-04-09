import BaseAPIService from '@/components/api/BaseAPIService'

class PlanGoalSubgoalService extends BaseAPIService {
    async getPendingPlansGoalsSubgoals(params: object): Promise<any> {
        return await this.request(`/user/citizens/pending-plans-goals-subgoals/all/list`, 'GET', params)
    }

    async getPlanGoalSubgoalGraph(modelUuid: object): Promise<any> {
        return await this.request(`/user/citizen-plans-goals-subgoals/${modelUuid}/statistics-graph`, 'GET')
    }

    async getPlanGoalSubgoalStatuses(params: object): Promise<any> {
        return await this.request(`/user/plan-goal-subgoal-attachments`, 'GET', params)
    }

    async deletePlanGoalSubgoalStatuses(attachmentUuid: any): Promise<any> {
        return await this.request(`/user/plan-goal-subgoal-attachments/${attachmentUuid}`, 'DELETE')
    }

    async downloadPlanGoalSubgoalStatuses(attachmentUuid: any): Promise<any> {
        return await this.request(`/user/plan-goal-subgoal-attachments/${attachmentUuid}/download`, 'GET')
    }
}
export const planGoalSubgoalService = new PlanGoalSubgoalService()