import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenDocumentTemplateService extends BaseAPIService {
    async saveDocumentResponses(params: any): Promise<any> {
        return await this.request(`/user/citizen-file-folders-attachments`, 'POST', params)
    }

    async saveDocumentResponsesAndDownloadPDF(params: any): Promise<any> {
        return await this.request(`/user/citizen-file-folders-attachments/download`, 'POST', params)
    }
}
export const citizenDocumentTemplateService = new CitizenDocumentTemplateService()