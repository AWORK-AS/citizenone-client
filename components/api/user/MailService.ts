import BaseAPIService from '@/components/api/BaseAPIService'

class MailService extends BaseAPIService {
    async fetchMailConfiguration(): Promise<any> {
        return await this.request(`/user/email-settings`, 'GET')
    }

    async saveUpdateMailConfiguration(params: object): Promise<any> {
        return await this.request(`/user/email-settings`, 'POST', params)
    }
}
export const mailService = new MailService()