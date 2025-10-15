import BaseAPIService from '@/components/api/BaseAPIService'

class MailEntraService extends BaseAPIService {
    async getMails(params: object): Promise<any> {
        return await this.request(`/user/entra/fetch/emails`, 'GET', params)
    }

    async getSentMails(params: object): Promise<any> {
        return await this.request(`/user/entra/fetch/sent-emails`, 'GET', params)
    }

    async readMail(emailId: any): Promise<any> {
        return await this.request(`/user/entra/${emailId}/mark-as-read`, 'PUT')
    }

    async replyMail(emailId: any, params: object): Promise<any> {
        return await this.request(`/user/entra/${emailId}/send-reply`, 'POST', params)
    }

    async forwardMail(emailId: any, params: object): Promise<any> {
        return await this.request(`/user/entra/${emailId}/forward`, 'POST', params)
    }

    async downloadAttachment(params: object): Promise<any> {
        return await this.request(`/user/entra/attachment/download`, 'GET', params)
    }
}
export const mailEntraService = new MailEntraService()