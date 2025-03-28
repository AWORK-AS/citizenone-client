import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenDocumentService extends BaseAPIService {
    async getCitizenDocuments(params: object): Promise<any> {
        return await this.request(`/relative/documents`, 'GET', params)
    }

    async downloadCitizenFile(documentUuid: any): Promise<any> {
        return await this.request(`/relative/documents/${documentUuid}/download`, 'GET')
    }
}

export const citizenDocumentService = new CitizenDocumentService()