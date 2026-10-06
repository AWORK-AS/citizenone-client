import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenDocumentService extends BaseAPIService {
    async getCitizenFileFolders(params: object): Promise<any> {
        return await this.request(`/user/citizen-file-folders`, 'GET', params)
    }    
    
    async getFolderPath(folderUuid: any): Promise<any> {
        return await this.request(`/user/citizen-file-folders/${folderUuid}/path`, 'GET')
    }

    async getCitizenFileFoldersDrafts(params: object): Promise<any> {
        return await this.request(`user/citizen-file-folders-attachments/drafts`, 'GET', params)
    }

    async getCitizenFileDetail(fileUuid: any): Promise<any> {
        return await this.request(`user/citizen-file-folders/${fileUuid}`, 'GET');
    }

    async saveCitizenFileFolder(params: object): Promise<any> {
        return await this.request(`/user/citizen-file-folders`, 'POST', params)
    }

    async updateCitizenFileFolder(directoryUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-file-folders/${directoryUuid}`, 'PUT', params)
    }

    async moveFile(fileUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-file-folders/${fileUuid}/move-file`, 'PUT', params)
    }

    async deleteDocument(citizenFileFolderUuid: any): Promise<any> {
        return await this.request(`/user/citizen-file-folders/${citizenFileFolderUuid}`, 'DELETE')
    }

    // As a blob whatever the file is: a plain request() hands text files back as
    // a string, which saveAs and the viewer can't use.
    async downloadCitizenFile(citizenFileFolderUuid: any): Promise<Blob | null> {
        return await this.requestBlob(`/user/citizen-file-folders/${citizenFileFolderUuid}/download`, 'GET')
    }

    // Same file and access checks as downloadCitizenFile, but served inline and
    // open to users without the download_documents permission.
    async viewCitizenFile(citizenFileFolderUuid: any): Promise<Blob | null> {
        return await this.requestBlob(`/user/citizen-file-folders/${citizenFileFolderUuid}/view`, 'GET')
    }

    async shareUnshareDocument(citizenFileFolderUuid: any): Promise<any> {
        return await this.request(`/user/citizen-file-folders/${citizenFileFolderUuid}/share-file`, 'PUT')
    }

    async archiveUnarchiveDocument(citizenFileFolderUuid: any): Promise<any> {
        return await this.request(`/user/citizen-file-folders/${citizenFileFolderUuid}/archive`, 'PUT')
    }

    async getAllFolders(citizenUuid: any): Promise<any> {
        return await this.request(`/user/citizen-file-folders/${citizenUuid}/all/list`, 'GET')
    }

    async getAllFilesPerCitizen(params: object): Promise<any> {
        return await this.request(`/user/citizen-file-folders/multiple/citizens/files/all/list`, 'GET', params)
    }

    async getAllFoldersPerCitizen(params: object): Promise<any> {
        return await this.request(`/user/citizen-file-folders/multiple/citizens/folders/all/list`, 'GET', params)
    }
}

export const citizenDocumentService = new CitizenDocumentService()