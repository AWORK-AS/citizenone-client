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
        return await this.request(`/user/forms/${formUuid}`, 'PUT', params)
    }

    async deleteForm(formUuid: any): Promise<any> {
        return await this.request(`/user/forms/${formUuid}`, 'DELETE')
    }

    async getAllForms(): Promise<any> {
        return await this.request(`/user/forms/all/list`, 'GET')
    }

    /** Renders the template as the document it will produce, including unsaved edits. */
    async previewForm(params: object): Promise<Blob | null> {
        return await this.requestBlob(`/user/forms/preview`, 'POST', params)
    }

    async getFormAssignments(params: object): Promise<any> {
        return await this.request(`/user/form-assignments`, 'GET', params)
    }

    async sendFormToPatient(formUuid: string, params: object): Promise<any> {
        return await this.request(`/user/forms/${formUuid}/assignments`, 'POST', params)
    }

    async withdrawFormAssignment(uuid: string): Promise<any> {
        return await this.request(`/user/form-assignments/${uuid}`, 'DELETE')
    }
}

export const formService = new FormService()