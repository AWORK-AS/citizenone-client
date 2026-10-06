import BaseAPIService from '@/components/api/BaseAPIService'

class InquiryFormService extends BaseAPIService {
    async getForms(): Promise<any> {
        return await this.request(`/user/inquiry-forms/all/list`, 'GET')
    }

    async saveForm(params: object): Promise<any> {
        return await this.request(`/user/inquiry-forms`, 'POST', params)
    }

    async updateForm(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/inquiry-forms/${uuid}`, 'PUT', params)
    }

    async deleteForm(uuid: string): Promise<any> {
        return await this.request(`/user/inquiry-forms/${uuid}`, 'DELETE')
    }

    async reorderForms(uuids: string[]): Promise<any> {
        return await this.request(`/user/inquiry-forms/reorder`, 'PUT', { uuids })
    }
}

export const inquiryFormService = new InquiryFormService()
