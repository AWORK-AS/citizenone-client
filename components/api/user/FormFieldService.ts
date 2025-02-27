import BaseAPIService from '@/components/api/user/BaseAPIService'

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
}

export const formFieldService = new FormFieldService()