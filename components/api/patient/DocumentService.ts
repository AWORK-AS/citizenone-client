import BaseAPIService from '@/components/api/BaseAPIService'

class PatientDocumentService extends BaseAPIService {
    async getDocuments(params: object): Promise<any> {
        return await this.request(`/patient/documents`, 'GET', params)
    }

    async upload(formData: FormData): Promise<any> {
        return await this.request(`/patient/documents`, 'POST', formData)
    }

    async download(uuid: string): Promise<any> {
        return await this.request(`/patient/documents/${uuid}/download`, 'GET')
    }
}

export const patientDocumentService = new PatientDocumentService()
