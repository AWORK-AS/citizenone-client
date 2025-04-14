import BaseAPIService from '@/components/api/BaseAPIService'

class DocumentTemplateService extends BaseAPIService {
    async saveDocumentResponses(params: any): Promise<any> {
        return await this.request(`/user/company-file-folders-attachments`, 'POST', params)
    }

    async saveDocumentResponsesAndDownloadPDF(params: any): Promise<any> {
        return await this.request(`/user/company-file-folders-attachments/download`, 'POST', params)
    }
}
export const documentTemplateService = new DocumentTemplateService()