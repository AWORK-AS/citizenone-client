import BaseAPIService from '@/components/api/BaseAPIService'

class InquirySettingService extends BaseAPIService {
    // Who the recruitment team is, and which task board their task lands on.
    async getRecruitment(): Promise<any> {
        return await this.request(`/user/inquiry-settings/recruitment`, 'GET')
    }

    async saveRecruitment(params: object): Promise<any> {
        return await this.request(`/user/inquiry-settings/recruitment`, 'PUT', params)
    }
}

export const inquirySettingService = new InquirySettingService()
