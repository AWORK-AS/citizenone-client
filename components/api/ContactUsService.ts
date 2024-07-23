import BaseAPIService from '@/components/api/BaseAPIService'

class ContactUsService extends BaseAPIService {
    async sendStorageUpgradeMessage(params: object): Promise<any> {
        return await this.request(`/user/contact-us/storage`, 'POST', params)
    }

    async sendWishMessage(params: object): Promise<any> {
        return await this.request(`/user/contact-us/wishes`, 'POST', params)
    }
}

export const contactUsService = new ContactUsService()