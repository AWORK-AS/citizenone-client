import BaseAPIService from '@/components/api/BaseAPIService'

class FormFieldService extends BaseAPIService {
    async getFormFields(params: object): Promise<any> {
        return await this.request(`/user/form-fields`, 'GET', params)
    }

    async getFormFieldResponses(params: object): Promise<any> {
        return await this.request(`/user/field-responses/all/list`, 'GET', params)
    }

    async saveResponses(params: object): Promise<any> {
        return await this.request(`/user/field-responses `, 'POST', params)
    }

    async savePlanGoalSubgoalResponsesAndDownloadPDF(params: object): Promise<any> {
        return await this.request(`/user/plan-goal-subgoal-attachments/download `, 'POST', params)
    }

    async updateAttachmentResponses(attachmentUuid: string, params: FormData): Promise<any> {
        params.append('_method', 'PUT')
        return await this.request(`/user/field-responses/${attachmentUuid}`, 'POST', params)
    }

}

export const formFieldService = new FormFieldService()