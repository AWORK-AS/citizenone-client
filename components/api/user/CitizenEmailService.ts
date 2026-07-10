import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenEmailService extends BaseAPIService {
    async getCitizenEmails(params: object): Promise<any> {
        return await this.request(`/user/citizen-emails`, 'GET', params)
    }

    async tagEmailToCitizen(params: object): Promise<any> {
        return await this.request(`/user/citizen-emails`, 'POST', params)
    }

    async updateEmailVisibility(citizenEmailUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-emails/${citizenEmailUuid}/visibility`, 'PUT', params)
    }

    async untagEmail(citizenEmailUuid: any): Promise<any> {
        return await this.request(`/user/citizen-emails/${citizenEmailUuid}`, 'DELETE')
    }
}

export const citizenEmailService = new CitizenEmailService()
