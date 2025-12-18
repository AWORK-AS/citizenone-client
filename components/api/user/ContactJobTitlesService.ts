import BaseAPIService from '@/components/api/BaseAPIService'

class ContactJobTitlesService extends BaseAPIService {
    async getContactJobTitles(params: object): Promise<any> {
        return await this.request(`/user/contact-job-titles`, 'GET', params)
    }

    async getContactJobTitle(contactJobTitleUuid: any): Promise<any> {
        return await this.request(`/user/contact-job-titles/${contactJobTitleUuid}`, 'GET')
    }

    async saveContactJobTitle(params: object): Promise<any> {
        return await this.request(`/user/contact-job-titles`, 'POST', params)
    }

    async updateContactJobTitle(contactJobTitleUuid: any, params: object): Promise<any> {
        return await this.request(`/user/contact-job-titles/${contactJobTitleUuid}`, 'PUT', params)
    }

    async deleteContactJobTitle(contactJobTitleUuid: any): Promise<any> {
        return await this.request(`/user/contact-job-titles/${contactJobTitleUuid}`, 'DELETE')
    }

    async getAllContactJobTitles(params: object): Promise<any> {
        return await this.request(`/user/contact-job-titles/all/list`, 'GET', params)
    }
}

export const contactJobTitlesService = new ContactJobTitlesService()