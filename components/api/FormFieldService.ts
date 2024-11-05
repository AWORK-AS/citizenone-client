import BaseAPIService from '@/components/api/BaseAPIService'

class FormFieldService extends BaseAPIService {
    async saveResponse(params: object): Promise<any> {
        return await this.request(`/user/field-responses `, 'POST', params)
    }
}

export const formFieldService = new FormFieldService()