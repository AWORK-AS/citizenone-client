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

    // Which of these inbox mails this user tagged to an intervention ("Tilknyttet indsats")
    async getLinkedCitizens(params: { source_uids: string[]; source_folder?: string }): Promise<any> {
        return await this.request(`/user/citizen-emails/linked`, 'POST', params)
    }

    async untagEmail(citizenEmailUuid: any): Promise<any> {
        return await this.request(`/user/citizen-emails/${citizenEmailUuid}`, 'DELETE')
    }
}

export const citizenEmailService = new CitizenEmailService()
