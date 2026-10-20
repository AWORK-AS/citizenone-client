import BaseAPIService from '@/components/api/BaseAPIService'

// Returned forms and surveys, in one list for staff to review. `type` is 'form' or 'survey'.
class QuestionnaireInboxService extends BaseAPIService {
    async getQuestionnaires(params: object = {}): Promise<any> {
        return await this.request(`/user/questionnaire-inbox`, 'GET', params)
    }

    async getToReviewCount(): Promise<any> {
        return await this.request(`/user/questionnaire-inbox/count`, 'GET')
    }

    async getQuestionnaire(type: string, uuid: string): Promise<any> {
        return await this.request(`/user/questionnaire-inbox/${type}/${uuid}`, 'GET')
    }

    async approve(type: string, uuid: string, params: object = {}): Promise<any> {
        return await this.request(`/user/questionnaire-inbox/${type}/${uuid}/approve`, 'POST', params)
    }

    async decline(type: string, uuid: string, params: object): Promise<any> {
        return await this.request(`/user/questionnaire-inbox/${type}/${uuid}/decline`, 'POST', params)
    }

    async reopen(type: string, uuid: string): Promise<any> {
        return await this.request(`/user/questionnaire-inbox/${type}/${uuid}/reopen`, 'POST')
    }
}

export const questionnaireInboxService = new QuestionnaireInboxService()
