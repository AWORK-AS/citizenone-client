import BaseAPIService from '@/components/api/user/BaseAPIService'

class SubgoalTemplateService extends BaseAPIService {
    async getTemplates(params: object): Promise<any> {
        return await this.request(`/user/subgoal-templates`, 'GET', params)
    }

    async saveTemplate(params: object): Promise<any> {
        return await this.request(`/user/subgoal-templates`, 'POST', params)
    }

    async updateTemplate(templateUuid: any, params: object): Promise<any> {
        return await this.request(`/user/subgoal-templates/${templateUuid}`, 'PUT', params)
    }

    async deleteTemplate(templateUuid: any): Promise<any> {
        return await this.request(`/user/subgoal-templates/${templateUuid}`, 'DELETE')
    }
}

export const subgoalTemplateService = new SubgoalTemplateService()