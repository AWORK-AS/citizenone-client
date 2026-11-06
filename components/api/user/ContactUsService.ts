import BaseAPIService from '@/components/api/BaseAPIService'

class ContactUsService extends BaseAPIService {
    async sendAppMessage(params: object): Promise<any> {
        return await this.request(`/user/contact-us/app`, 'POST', params)
    }

    async sendStorageUpgradeMessage(params: object): Promise<any> {
        return await this.request(`/user/contact-us/storage`, 'POST', params)
    }

    async sendWishMessage(formData: FormData): Promise<any> {
        return await this.requestFormData(`/user/contact-us/wishes`, formData)
    }

    async getWishes(): Promise<any> {
        return await this.request(`/user/contact-us/wishes`, 'GET')
    }
}

export const contactUsService = new ContactUsService()