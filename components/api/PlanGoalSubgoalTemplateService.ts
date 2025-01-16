import BaseAPIService from '@/components/api/BaseAPIService'

class PlanGoalSubgoalTemplateService extends BaseAPIService {
    async getTemplates(params: object): Promise<any> {
        return await this.request(`/user/plan-goal-subgoal-templates`, 'GET', params)
    }

    async saveTemplate(params: object): Promise<any> {
        return await this.request(`/user/plan-goal-subgoal-templates`, 'POST', params)
    }

    async updateTemplate(templateUuid: any, params: object): Promise<any> {
        return await this.request(`/user/plan-goal-subgoal-templates/${templateUuid}`, 'PUT', params)
    }

    async deleteTemplate(templateUuid: any): Promise<any> {
        return await this.request(`/user/plan-goal-subgoal-templates/${templateUuid}`, 'DELETE')
    }
}

export const planGoalSubgoalTemplateService = new PlanGoalSubgoalTemplateService()