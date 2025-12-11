import BaseAPIService from '@/components/api/BaseAPIService'

class DraftTemplateService extends BaseAPIService {
    async getDraftTemplates(params: object): Promise<any> {
        return await this.request(`/user/draft-templates`, 'GET', params)
    }

    async getDraftTemplateDetails(uuid: string): Promise<any> {
        return await this.request(`/user/draft-templates/${uuid}`, 'GET')
    }

    async saveDraftTemplate(params: object): Promise<any> {
        return await this.request(`/user/draft-templates`, 'POST', params)
    }

    async updateDraftTemplate(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/draft-templates/${uuid}`, 'PUT', params)
    }

    async deleteDraftTemplate(uuid: string): Promise<any> {
        return await this.request(`/user/draft-templates/${uuid}`, 'DELETE')
    }
}

export const draftTemplateService = new DraftTemplateService()