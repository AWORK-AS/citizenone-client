import BaseAPIService from '@/components/api/BaseAPIService'

class MailSettingService extends BaseAPIService {
    async getMailSettings(): Promise<any> {
        return await this.request(`/user/email-settings`, 'GET')
    }

    async saveUpdateMailSettings(params: object): Promise<any> {
        return await this.request(`/user/email-settings`, 'POST', params)
    }

    async microsoftCallback(params: object): Promise<any> {
        return await this.request(`/user/entra/auth/microsoft/callback`, 'POST', params)
    }
}
export const mailSettingService = new MailSettingService()