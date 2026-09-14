import BaseAPIService from '@/components/api/BaseAPIService'

class PatientFormService extends BaseAPIService {
    async getForms(): Promise<any> {
        return await this.request(`/patient/forms`, 'GET')
    }

    async getForm(uuid: string): Promise<any> {
        return await this.request(`/patient/forms/${uuid}`, 'GET')
    }

    async submitForm(uuid: string, params: object): Promise<any> {
        return await this.request(`/patient/forms/${uuid}/submit`, 'PUT', params)
    }
}

export const patientFormService = new PatientFormService()
