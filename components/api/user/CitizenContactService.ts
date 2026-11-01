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

    async getCoordinators(citizenUuid: any): Promise<any> {
        return await this.request(`/user/citizen-contacts/${citizenUuid}/coordinators`, 'GET')
    }

    async getCoordinatorDistribution(): Promise<any> {
        return await this.request(`/user/citizen-contacts/all/coordinator-distribution`, 'GET')
    }

    async updateCoordinators(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-contacts/${citizenUuid}/coordinators`, 'PUT', params)
    }

    async getConsultantHours(citizenUuid: string): Promise<any> {
        return await this.request(`/user/citizen-contacts/${citizenUuid}/consultant-hours`, 'GET')
    }

    async updateConsultantHours(citizenUuid: string, contactUuid: string, params: { weekly_hours: number | null }): Promise<any> {
        return await this.request(`/user/citizen-contacts/${citizenUuid}/consultant-hours/${contactUuid}`, 'PUT', params)
    }

    async getAllCitizenContactPersons(params: object): Promise<any> {
        return await this.request(`/user/citizen-contact-persons/all/list`, 'GET', params)
    }
}

export const citizenContactService = new CitizenContactService()