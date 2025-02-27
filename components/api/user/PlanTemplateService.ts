import BaseAPIService from '@/components/api/user/BaseAPIService'

class PlanTemplateService extends BaseAPIService {
    async getTemplates(params: object): Promise<any> {
        return await this.request(`/user/plan-templates`, 'GET', params)
    }

    async saveTemplate(params: object): Promise<any> {
        return await this.request(`/user/plan-templates`, 'POST', params)
    }

    async updateTemplate(templateUuid: any, params: object): Promise<any> {
        return await this.request(`/user/plan-templates/${templateUuid}`, 'PUT', params)
    }

    async deleteTemplate(templateUuid: any): Promise<any> {
        return await this.request(`/user/plan-templates/${templateUuid}`, 'DELETE')
    }
}

export const planTemplateService = new PlanTemplateService()