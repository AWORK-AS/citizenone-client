import BaseAPIService from '@/components/api/BaseAPIService'

class DocumentService extends BaseAPIService {
    async getDocuments(params: object): Promise<any> {
        return await this.request(`/citizen/documents`, 'GET', params)
    }

    async downloadFile(documentUuid: any): Promise<any> {
        return await this.request(`/citizen/documents/${documentUuid}/download`, 'GET')
    }
}

export const documentService = new DocumentService()