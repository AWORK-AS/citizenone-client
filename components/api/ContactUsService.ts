import BaseAPIService from '@/components/api/BaseAPIService'

class ContactUsService extends BaseAPIService {
    async sendStorageUpgradeMessage(params: object): Promise<any> {
        return await this.request(`/user/contact-us/storage`, 'POST', params)
    }
}

export const contactUsService = new ContactUsService()