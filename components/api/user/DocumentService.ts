import BaseAPIService from '@/components/api/BaseAPIService'

class DocumentService extends BaseAPIService {
    async getFileFolders(params: object): Promise<any> {
        return await this.request(`/user/company-file-folders`, 'GET', params)
    }

    async getFolderPath(folderUuid: any): Promise<any> {
        return await this.request(`/user/company-file-folders/${folderUuid}/path`, 'GET')
    }

    async saveFileFolder(params: object): Promise<any> {
        return await this.request(`/user/company-file-folders`, 'POST', params)
    }

    async updateFileFolder(directoryUuid: any, params: object): Promise<any> {
        return await this.request(`/user/company-file-folders/${directoryUuid}`, 'PUT', params)
    }

    async moveFile(fileUuid: any, params: object): Promise<any> {
        return await this.request(`/user/company-file-folders/${fileUuid}/move-file`, 'PUT', params)
    }

    async getDocumentContent(documentUuid: any, params: object): Promise<any> {
        return await this.request(`/user/company-file-folders/${documentUuid}/content`, 'GET', params)
    }

    async updateDocumentContent(documentUuid: any, params: object): Promise<any> {
        return await this.request(`/user/company-file-folders/${documentUuid}/content`, 'PUT', params)
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

    async permanentlyDeleteDocument(documentUuid: any): Promise<any> {
        return await this.request(`/user/archived-documents/${documentUuid}/permanent-delete`, 'DELETE')
    }

    // As a blob whatever the file is: a plain request() hands text files back as
    // a string, which saveAs and the viewer can't use.
    async downloadArchivedDocument(documentUuid: any): Promise<Blob | null> {
        return await this.requestBlob(`/user/archived-documents/${documentUuid}/download`, 'GET')
    }

    async viewArchivedDocument(documentUuid: any): Promise<Blob | null> {
        return await this.requestBlob(`/user/archived-documents/${documentUuid}/view`, 'GET')
    }

    async downloadFile(documentUuid: any): Promise<Blob | null> {
        return await this.requestBlob(`/user/company-file-folders/${documentUuid}/download`, 'GET')
    }

    // Same file and access checks as downloadFile, but served inline and open
    // to users without the download_documents permission.
    async viewFile(documentUuid: any): Promise<Blob | null> {
        return await this.requestBlob(`/user/company-file-folders/${documentUuid}/view`, 'GET')
    }

    async downloadPdf(documentUuid: any, params?: object): Promise<any> {
        return await this.request(`/user/company-file-folders/${documentUuid}/download-pdf`, 'GET', params)
    }

    async getAllFolders(): Promise<any> {
        return await this.request(`/user/company-file-folders/all/list`, 'GET')
    }

    async getAllFiles(): Promise<any> {
        return await this.request(`/user/company-file-folders/all/file-list`, 'GET')
    }
}

export const documentService = new DocumentService()