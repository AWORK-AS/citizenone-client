import BaseAPIService from '@/components/api/BaseAPIService'

class NursingProfessionalRecordTemplateService extends BaseAPIService {
    async getTemplates(params: object): Promise<any> {
        return await this.request(`/user/nursing-professional-record-templates`, 'GET', params)
    }

    async getAllTemplates(): Promise<any> {
        return await this.request(`/user/nursing-professional-record-templates/all/list`, 'GET')
    }

    async getTemplate(templateUuid: any): Promise<any> {
        return await this.request(`/user/nursing-professional-record-templates/${templateUuid}`, 'GET')
    }

    async saveTemplate(params: object): Promise<any> {
        return await this.request(`/user/nursing-professional-record-templates`, 'POST', params)
    }

    async updateTemplate(templateUuid: any, params: object): Promise<any> {
        return await this.request(`/user/nursing-professional-record-templates/${templateUuid}`, 'PUT', params)
    }

    async deleteTemplate(templateUuid: any): Promise<any> {
        return await this.request(`/user/nursing-professional-record-templates/${templateUuid}`, 'DELETE')
    }
}

export const nursingProfessionalRecordTemplateService = new NursingProfessionalRecordTemplateService()
