import BaseAPIService from '@/components/api/BaseAPIService'

class CompanyContactService extends BaseAPIService {
    async getContacts(params: object): Promise<any> {
        return await this.request(`/user/company-contacts`, 'GET', params)
    }

    async getContactList(): Promise<any> {
        return await this.request(`/user/company-contacts/all/list`, 'GET')
    }

    async saveContact(params: object): Promise<any> {
        return await this.request(`/user/company-contacts`, 'POST', params)
    }

    async updateContact(contactUuid: string, params: object): Promise<any> {
        return await this.request(`/user/company-contacts/${contactUuid}`, 'POST', params)
    }

    async deleteContact(contactUuid: string): Promise<any> {
        return await this.request(`/user/company-contacts/${contactUuid}`, 'DELETE')
    }
}

export const companyContactService = new CompanyContactService()
