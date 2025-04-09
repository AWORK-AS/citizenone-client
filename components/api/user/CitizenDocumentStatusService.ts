import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenDocumentStatusService extends BaseAPIService {
    async getDocumentStatuses(params: object): Promise<any> {
        return await this.request(`/user/citizen-file-folders-attachments`, 'GET', params)
    }

    async downloadDocumentStatuses(attachmentUuid: any): Promise<any> {
        return await this.request(`/user/citizen-file-folders-attachments/${attachmentUuid}/download`, 'GET')
    }

    async deleteDocumentStatuses(attachmentUuid: any): Promise<any> {
        return await this.request(`/user/citizen-file-folders-attachments/${attachmentUuid}`, 'DELETE')
    }
}
export const citizenDocumentStatusService = new CitizenDocumentStatusService()