import BaseAPIService from '@/components/api/BaseAPIService'

class FolderStructureRequestService extends BaseAPIService {
    async getFolderStructureRequests(params: object): Promise<any> {
        return await this.request(`/user/folder-structure-edit-requests`, 'GET', params)
    }

    async saveFolderStructureRequest(params: object): Promise<any> {
        return await this.request(`/user/folder-structure-edit-requests`, 'POST', params)
    }

    async updateFolderStructureRequest(folderStructureRequestUuid: any, params: object): Promise<any> {
        return await this.request(`/user/folder-structure-edit-requests/${folderStructureRequestUuid}`, 'PUT', params)
    }

    async approveFolderStructureRequest(folderStructureRequestUuid: any): Promise<any> {
        return await this.request(`/user/folder-structure-edit-requests/${folderStructureRequestUuid}/approve`, 'PUT')
    }

    async disapproveFolderStructureRequest(folderStructureRequestUuid: any): Promise<any> {
        return await this.request(`/user/folder-structure-edit-requests/${folderStructureRequestUuid}/disapprove`, 'PUT')
    }
}

export const folderStructureRequestService = new FolderStructureRequestService()