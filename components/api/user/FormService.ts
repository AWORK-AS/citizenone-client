import BaseAPIService from '@/components/api/BaseAPIService'

class FormService extends BaseAPIService {
    async getForms(params: object): Promise<any> {
        return await this.request(`/user/forms`, 'GET', params)
    }

    async getForm(formUuid: any): Promise<any> {
        return await this.request(`/user/forms/${formUuid}`, 'GET')
    }

    async saveForm(params: object): Promise<any> {
        return await this.request(`/user/forms`, 'POST', params)
    }

    async updateForm(formUuid: any, params: object): Promise<any> {
        return await this.request(`/user/forms/${formUuid}/update`, 'POST', params)
    }

    async deleteForm(formUuid: any): Promise<any> {
        return await this.request(`/user/forms/${formUuid}`, 'DELETE')
    }

    async getAllForms(): Promise<any> {
        return await this.request(`/user/forms/all/list`, 'GET')
    }
}

export const formService = new FormService()