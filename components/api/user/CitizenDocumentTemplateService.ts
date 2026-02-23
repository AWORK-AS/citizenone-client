import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenDocumentTemplateService extends BaseAPIService {
    async saveDocumentResponses(params: any): Promise<any> {
        return await this.request(`/user/citizen-file-folders-attachments`, 'POST', params)
    }

    async updateDocumentResponses(params: any, attachmentUuid: string, fileUuid: string): Promise<any> {
        return await this.request(`user/citizen-file-folders/${attachmentUuid}/${fileUuid}/update`, 'POST', params)
    }

    async updateDocumentResponsesAndDownloadPDF(params: any, attachmentUuid: string, fileUuid: string): Promise<any> {
        return await this.request(`user/citizen-file-folders-attachments/download/${attachmentUuid}/${fileUuid}`, 'POST', params)
    }

    async saveDocumentResponsesAndDownloadPDF(params: any): Promise<any> {
        return await this.request(`/user/citizen-file-folders-attachments/download`, 'POST', params)
    }


}
export const citizenDocumentTemplateService = new CitizenDocumentTemplateService()