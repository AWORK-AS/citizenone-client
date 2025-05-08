import BaseAPIService from '@/components/api/BaseAPIService'

class MailService extends BaseAPIService {
    async getMails(params: object): Promise<any> {
        return await this.request(`/user/emails`, 'GET', params)
    }

    async getSecuredMails(params: object): Promise<any> {
        return await this.request(`/user/encrypted-emails`, 'GET', params)
    }

    async getSentMails(params: object): Promise<any> {
        return await this.request(`/user/emails/sent/list`, 'GET', params)
    }

    async getMail(emailUuid: any): Promise<any> {
        return await this.request(`/user/emails/${emailUuid}`, 'GET')
    }

    async sendMail(params: object): Promise<any> {
        return await this.request(`/user/emails`, 'POST', params)
    }

    async deleteMail(emailUuid: any): Promise<any> {
        return await this.request(`/user/emails/${emailUuid}`, 'DELETE')
    }

    async replyMail(emailUid: any, params: object): Promise<any> {
        return await this.request(`/user/emails/${emailUid}/send-reply`, 'POST', params)
    }

    async replySecuredMail(emailUuid: any, params: object): Promise<any> {
        return await this.request(`/user/encrypted-emails/${emailUuid}/send-reply`, 'POST', params)
    }

    async readMail(emailUid: any): Promise<any> {
        return await this.request(`/user/mails/${emailUid}/mark-read`, 'PUT')
    }

    async readSecuredMail(emailUuid: any): Promise<any> {
        return await this.request(`/user/encrypted-emails/${emailUuid}/mark-read`, 'PUT')
    }
}
export const mailService = new MailService()