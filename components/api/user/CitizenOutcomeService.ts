import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenOutcomeService extends BaseAPIService {
    async getOutcomes(params: object): Promise<any> {
        return await this.request(`/user/employment/citizen-outcomes`, 'GET', params)
    }

    async getOutcomesByCitizen(citizenUuid: any): Promise<any> {
        return await this.request(`/user/employment/${citizenUuid}/citizen-outcomes/list`, 'GET')
    }

    async getOutcome(uuid: any): Promise<any> {
        return await this.request(`/user/employment/citizen-outcomes/${uuid}`, 'GET')
    }

    async saveOutcome(params: object): Promise<any> {
        return await this.request(`/user/employment/citizen-outcomes`, 'POST', params)
    }

    async updateOutcome(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/employment/citizen-outcomes/${uuid}`, 'PUT', params)
    }

    async deleteOutcome(uuid: any): Promise<any> {
        return await this.request(`/user/employment/citizen-outcomes/${uuid}`, 'DELETE')
    }
}

export const citizenOutcomeService = new CitizenOutcomeService()
