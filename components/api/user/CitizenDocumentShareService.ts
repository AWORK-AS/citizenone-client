import BaseAPIService from '@/components/api/BaseAPIService'

// Password-protected, expiring links to a citizen's document or folder, mailed
// to someone outside the company.
class CitizenDocumentShareService extends BaseAPIService {
    async getShareLinks(params: object): Promise<any> {
        return await this.request(`/user/citizen-document-share-links`, 'GET', params)
    }

    async sendShareLink(params: object): Promise<any> {
        return await this.request(`/user/citizen-document-share-links`, 'POST', params)
    }

    async revokeShareLink(shareLinkUuid: string): Promise<any> {
        return await this.request(`/user/citizen-document-share-links/${shareLinkUuid}`, 'DELETE')
    }
}

export const citizenDocumentShareService = new CitizenDocumentShareService()
