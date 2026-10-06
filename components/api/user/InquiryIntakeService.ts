import BaseAPIService from '@/components/api/BaseAPIService'

class InquiryIntakeService extends BaseAPIService {
    async getStatus(): Promise<any> {
        return await this.request(`/user/inquiry-intake`, 'GET')
    }

    async generateKey(): Promise<any> {
        return await this.request(`/user/inquiry-intake/key`, 'POST')
    }

    async revokeKey(): Promise<any> {
        return await this.request(`/user/inquiry-intake/key`, 'DELETE')
    }
}

export const inquiryIntakeService = new InquiryIntakeService()
