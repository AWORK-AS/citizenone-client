import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenDocumentService extends BaseAPIService {
    async getCitizenFileFolders(params: object): Promise<any> {
        return await this.request(`/user/citizen-file-folders`, 'GET', params)
    }

    async saveCitizenFileFolder(params: object): Promise<any> {
        return await this.request(`/user/citizen-file-folders`, 'POST', params)
    }

    async updateCitizenFileFolder(directoryUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-file-folders/${directoryUuid}`, 'PUT', params)
    }

    async deleteDocument(citizenFileFolderUuid: any): Promise<any> {
        return await this.request(`/user/citizen-file-folders/${citizenFileFolderUuid}`, 'DELETE')
    }

    async archiveUnarchiveDocument(citizenFileFolderUuid: any): Promise<any> {
        return await this.request(`/user/citizen-file-folders/${citizenFileFolderUuid}/archive`, 'PUT')
    }
}

export const citizenDocumentService = new CitizenDocumentService()