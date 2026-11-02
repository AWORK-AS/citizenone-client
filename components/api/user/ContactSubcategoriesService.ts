import BaseAPIService from '@/components/api/BaseAPIService'

// The company's own subcategories under "Vores kontaktperson".
class ContactSubcategoriesService extends BaseAPIService {
    async getContactSubcategories(): Promise<any> {
        return await this.request(`/user/contact-subcategories`, 'GET')
    }

    async saveContactSubcategory(params: object): Promise<any> {
        return await this.request(`/user/contact-subcategories`, 'POST', params)
    }
}

export const contactSubcategoriesService = new ContactSubcategoriesService()
