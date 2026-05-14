import BaseAPIService from '@/components/api/BaseAPIService'

class TreatmentTemplateService extends BaseAPIService {
    async getTemplates(params: object): Promise<any> {
        return await this.request(`/user/treatment-templates`, 'GET', params)
    }

    async getAllTemplates(): Promise<any> {
        return await this.request(`/user/treatment-templates/all/list`, 'GET')
    }

    async getTemplate(templateUuid: any): Promise<any> {
        return await this.request(`/user/treatment-templates/${templateUuid}`, 'GET')
    }

    async saveTemplate(params: object): Promise<any> {
        return await this.request(`/user/treatment-templates`, 'POST', params)
    }

    async updateTemplate(templateUuid: any, params: object): Promise<any> {
        return await this.request(`/user/treatment-templates/${templateUuid}`, 'PUT', params)
    }

    async deleteTemplate(templateUuid: any): Promise<any> {
        return await this.request(`/user/treatment-templates/${templateUuid}`, 'DELETE')
    }
}

export const treatmentTemplateService = new TreatmentTemplateService()
