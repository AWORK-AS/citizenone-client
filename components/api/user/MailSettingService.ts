import BaseAPIService from '@/components/api/BaseAPIService'

class MailSettingService extends BaseAPIService {
    async getMailSettings(): Promise<any> {
        return await this.request(`/user/email-settings`, 'GET')
    }

    async saveUpdateMailSettings(params: object): Promise<any> {
        return await this.request(`/user/email-settings`, 'POST', params)
    }
}
export const mailSettingService = new MailSettingService()