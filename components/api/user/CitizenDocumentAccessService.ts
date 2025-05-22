import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenDocumentAccessService extends BaseAPIService {
    async getCitizenFileFolderAccesses(params: object): Promise<any> {
        return await this.request(`/user/citizen-file-folders-access`, 'GET', params)
    }

    async saveCitizenFileFolderAccess(params: object): Promise<any> {
        return await this.request(`/user/citizen-file-folders-access`, 'POST', params)
    }

    async deleteCitizenFileFolderAccess(citizenFileFolderAccessUuid: any): Promise<any> {
        return await this.request(`/user/citizen-file-folders-access/${citizenFileFolderAccessUuid}`, 'DELETE')
    }
}

export const citizenDocumentAccessService = new CitizenDocumentAccessService()