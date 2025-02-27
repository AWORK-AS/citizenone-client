import BaseAPIService from '@/components/api/user/BaseAPIService'

class FolderStructureService extends BaseAPIService {
    async getFolderStructures(params: object): Promise<any> {
        return await this.request(`/user/folder-structures`, 'GET', params)
    }

    async getFolderStructure(folderStructureUuid: any): Promise<any> {
        return await this.request(`/user/folder-structures/${folderStructureUuid}`, 'GET')
    }

    async saveFolderStructure(params: object): Promise<any> {
        return await this.request(`/user/folder-structures`, 'POST', params)
    }

    async updateFolderStructure(folderStructureUuid: any, params: object): Promise<any> {
        return await this.request(`/user/folder-structures/${folderStructureUuid}`, 'PUT', params)
    }

    async getAllTemplatesForCompany(): Promise<any> {
        return await this.request(`/user/folder-structures/company/list`, 'GET')
    }

    async getAllTemplatesForCitizen(): Promise<any> {
        return await this.request(`/user/folder-structures/citizen/list`, 'GET')
    }
}

export const folderStructureService = new FolderStructureService()