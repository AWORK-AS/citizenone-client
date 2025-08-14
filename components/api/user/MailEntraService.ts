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
}
export const mailEntraService = new MailEntraService()