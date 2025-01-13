import BaseAPIService from '@/components/api/BaseAPIService'

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
}

export const folderStructureService = new FolderStructureService()