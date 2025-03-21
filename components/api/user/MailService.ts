import BaseAPIService from '@/components/api/BaseAPIService'

class MailService extends BaseAPIService {
    async getMails(params: object): Promise<any> {
        return await this.request(`/user/emails`, 'GET', params)
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
}
export const mailService = new MailService()