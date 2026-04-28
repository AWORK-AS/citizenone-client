import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenCompanyContactService extends BaseAPIService {
    async getByCitizen(citizenUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/company-contacts`, 'GET')
    }

    async assign(citizenUuid: string, contactUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/company-contacts/assign/${contactUuid}`, 'POST')
    }

    async unassign(citizenUuid: string, contactUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/company-contacts/${contactUuid}`, 'DELETE')
    }
}

export const citizenCompanyContactService = new CitizenCompanyContactService()
