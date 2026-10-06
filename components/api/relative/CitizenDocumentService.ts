import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenDocumentService extends BaseAPIService {
    async getCitizenDocuments(params: object): Promise<any> {
        return await this.request(`/relative/documents`, 'GET', params)
    }

    // As a blob whatever the file is: a plain request() hands text files back as
    // a string, which saveAs and the viewer can't use.
    async downloadCitizenFile(documentUuid: any): Promise<Blob | null> {
        return await this.requestBlob(`/relative/documents/${documentUuid}/download`, 'GET')
    }
}

export const citizenDocumentService = new CitizenDocumentService()