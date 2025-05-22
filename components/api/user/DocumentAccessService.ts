import BaseAPIService from '@/components/api/BaseAPIService'

class DocumentAccessService extends BaseAPIService {
    async getFileFoldersAccesses(params: object): Promise<any> {
        return await this.request(`/user/company-file-folders-access`, 'GET', params)
    }

    async saveFileFoldersAccess(params: object): Promise<any> {
        return await this.request(`/user/company-file-folders-access`, 'POST', params)
    }

    async deleteFileFoldersAccess(documentUuid: any): Promise<any> {
        return await this.request(`/user/company-file-folders-access/${documentUuid}`, 'DELETE')
    }
}

export const documentAccessService = new DocumentAccessService()