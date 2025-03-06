import BaseAPIService from '@/components/api/BaseAPIService'

class GoalTemplateService extends BaseAPIService {
    async getTemplates(params: object): Promise<any> {
        return await this.request(`/user/goal-templates`, 'GET', params)
    }

    async saveTemplate(params: object): Promise<any> {
        return await this.request(`/user/goal-templates`, 'POST', params)
    }

    async updateTemplate(templateUuid: any, params: object): Promise<any> {
        return await this.request(`/user/goal-templates/${templateUuid}`, 'PUT', params)
    }

    async deleteTemplate(templateUuid: any): Promise<any> {
        return await this.request(`/user/goal-templates/${templateUuid}`, 'DELETE')
    }
}

export const goalTemplateService = new GoalTemplateService()