import BaseAPIService from '@/components/api/BaseAPIService'

class ImportService extends BaseAPIService {
    async undoImport(params: object): Promise<any> {
        return await this.request(`/user/imports/undo`, 'POST', params)
    }

    async sendInvites(params: object): Promise<any> {
        return await this.request(`/user/imports/send-invites`, 'POST', params)
    }
}

export const importService = new ImportService()
