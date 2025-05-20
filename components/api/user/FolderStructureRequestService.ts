import BaseAPIService from '@/components/api/BaseAPIService'

class FolderStructureRequestService extends BaseAPIService {
    async getFolderStructureRequests(params: object): Promise<any> {
        return await this.request(`/user/folder-structure-edit-requests`, 'GET', params)
    }

    async saveFolderStructureRequest(params: object): Promise<any> {
        return await this.request(`/user/folder-structure-edit-requests`, 'POST', params)
    }

    async updateFolderStructureRequest(folderStructureUuid: any, params: object): Promise<any> {
        return await this.request(`/user/folder-structure-edit-requests/${folderStructureUuid}`, 'PUT', params)
    }

    async approveFolderStructureRequest(folderStructureUuid: any): Promise<any> {
        return await this.request(`/user/folder-structure-edit-requests/${folderStructureUuid}/approve`, 'PUT')
    }
}

export const folderStructureRequestService = new FolderStructureRequestService()