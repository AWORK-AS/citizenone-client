import BaseAPIService from '@/components/api/BaseAPIService'

class FormFieldConfigService extends BaseAPIService {
    async getFormConfigs(params: object): Promise<any> {
        return await this.request(`/user/form-field-configs`, 'GET', params)
    }

    async updateFormConfig(params: object): Promise<any> {
        return await this.request(`/user/form-field-configs`, 'POST', params)
    }
}

export const formFieldConfigService = new FormFieldConfigService()
