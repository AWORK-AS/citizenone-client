import BaseAPIService from '@/components/api/BaseAPIService'

class SecuredMailService extends BaseAPIService {
    async unlockMessage(emailUuid: any, params: object): Promise<any> {
        return await this.request(`/user/encrypted-email/${emailUuid}/decrypt`, 'POST', params)
    }

    async saveReply(params: object): Promise<any> {
        return await this.request(`/secure-mail-replies`, 'POST', params)
    }

    async downloadAttachment(params: object): Promise<any> {
        return await this.request(`/user/encrypted-email/attachment/download`, 'GET', params)
    }

    async downloadAttachmentWithoutAuthentication(params: object): Promise<any> {
        return await this.request(`/encrypted-email/attachment/download`, 'GET', params)
    }
}

export const securedMailService = new SecuredMailService()