import BaseAPIService from '@/components/api/BaseAPIService'

class DocumentService extends BaseAPIService {
    async getFileFolders(params: object): Promise<any> {
        return await this.request(`/user/company-file-folders`, 'GET', params)
    }

    async saveFileFolder(params: object): Promise<any> {
        return await this.request(`/user/company-file-folders`, 'POST', params)
    }

    async updateFileFolder(directoryUuid: any, params: object): Promise<any> {
        return await this.request(`/user/company-file-folders/${directoryUuid}`, 'PUT', params)
    }

    async deleteDocument(documentUuid: any): Promise<any> {
        return await this.request(`/user/company-file-folders/${documentUuid}`, 'DELETE')
    }

    async archiveUnarchiveDocument(documentUuid: any): Promise<any> {
        return await this.request(`/user/company-file-folders/${documentUuid}/archive`, 'PUT')
    }

    async getArchivedDocuments(params: object): Promise<any> {
        return await this.request(`/user/archived-documents`, 'GET', params)
    }

    async unarchiveDocument(documentUuid: object): Promise<any> {
        return await this.request(`/user/archived-documents/${documentUuid}/toggle-archive`, 'PUT')
    }

    async downloadArchivedDocument(documentUuid: any): Promise<any> {
        return await this.request(`/user/archived-documents/${documentUuid}/download`, 'GET')
    }
}

export const documentService = new DocumentService()