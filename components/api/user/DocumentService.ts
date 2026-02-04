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

    async moveFile(fileUuid: any, params: object): Promise<any> {
        return await this.request(`/user/company-file-folders/${fileUuid}/move-file`, 'PUT', params)
    }

    async getContent(documentUuid: any, params: object): Promise<any> {
        return await this.request(`/user/company-file-folders/${documentUuid}/content`, 'GET', params)

        // if (mode === 'preview' && response.content) {
        //     const binaryString = window.atob(response.content)
        //     const len = binaryString.length
        //     const bytes = new Uint8Array(len)
        //     for (let i = 0; i < len; i++) {
        //         bytes[i] = binaryString.charCodeAt(i)
        //     }
        //     return bytes.buffer
        // }

        // return response
    }

    async saveContent(documentUuid: any, params: object): Promise<any> {
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

    async downloadArchivedDocument(documentUuid: any): Promise<any> {
        return await this.request(`/user/archived-documents/${documentUuid}/download`, 'GET')
    }

    async downloadFile(documentUuid: any): Promise<any> {
        return await this.request(`/user/company-file-folders/${documentUuid}/download`, 'GET')
    }

    async downloadPdf(documentUuid: any): Promise<any> {
        return await this.request(`/user/company-file-folders/${documentUuid}/download-pdf`, 'GET')
    }

    async getAllFolders(): Promise<any> {
        return await this.request(`/user/company-file-folders/all/list`, 'GET')
    }

    async getAllFiles(): Promise<any> {
        return await this.request(`/user/company-file-folders/all/file-list`, 'GET')
    }
}

export const documentService = new DocumentService()