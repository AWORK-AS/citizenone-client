import BaseAPIService from '@/components/api/BaseAPIService'

class SmsService extends BaseAPIService {
    async getSettings(): Promise<any> {
        return await this.request(`/user/sms/settings`, 'GET')
    }

    async updateSettings(params: object): Promise<any> {
        return await this.request(`/user/sms/settings`, 'PUT', params)
    }
}

export const smsService = new SmsService()
