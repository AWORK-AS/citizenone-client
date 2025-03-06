import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenContactService extends BaseAPIService {
    async getContacts(params: object): Promise<any> {
        return await this.request(`/user/citizen-contacts`, 'GET', params)
    }

    async saveContact(params: object): Promise<any> {
        return await this.request(`/user/citizen-contacts`, 'POST', params)
    }

    async updateContact(contactUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-contacts/${contactUuid}`, 'PUT', params)
    }

    async deleteContact(contactUuid: any): Promise<any> {
        return await this.request(`/user/citizen-contacts/${contactUuid}`, 'DELETE')
    }
}

export const citizenContactService = new CitizenContactService()