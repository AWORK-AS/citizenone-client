import BaseAPIService from '@/components/api/BaseAPIService'

class DocumentService extends BaseAPIService {
    async getCitizenFileFolders(params: object): Promise<any> {
        return await this.request(`/user/company-documents`, 'GET', params)
    }

    async saveCitizenFileFolder(params: object): Promise<any> {
        return await this.request(`/user/company-documents`, 'POST', params)
    }

    async updateCitizenFileFolder(directoryUuid: any, params: object): Promise<any> {
        return await this.request(`/user/company-documents/${directoryUuid}`, 'PUT', params)
    }

    async deleteDocument(documentUuid: any): Promise<any> {
        return await this.request(`/user/company-documents/${documentUuid}`, 'DELETE')
    }

    async archiveUnarchiveDocument(documentUuid: any): Promise<any> {
        return await this.request(`/user/company-documents/${documentUuid}/archive`, 'PUT')
    }

    async getArchivedDocuments(params: object): Promise<any> {
        return await this.request(`/user/archived-documents`, 'GET', params)
    }

    async unarchiveDocument(documentUuid: object): Promise<any> {
        return await this.request(`/user/archived-documents/${documentUuid}/toggle-archive`, 'PUT')
    }
}

export const documentService = new DocumentService()