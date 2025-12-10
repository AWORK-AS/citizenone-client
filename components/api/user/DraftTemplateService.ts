import BaseAPIService from '@/components/api/BaseAPIService'

class DraftTemplateService extends BaseAPIService {
    async getDraftTemplates(params: object): Promise<any> {
        return await this.request(`/user/draft-templates`, 'GET', params)
    }

    async saveDraftTemplate(params: object): Promise<any> {
        return await this.request(`/user/draft-templates`, 'POST', params)
    }
}

export const draftTemplateService = new DraftTemplateService()