import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenService extends BaseAPIService {
    async getCurrentLoggedInCitizen(): Promise<any> {
        return await this.request(`/citizen`, 'GET')
    }

    async updateCitizenLangugage(params: object): Promise<any> {
        return await this.request(`/citizen/update/language`, 'PUT', params)
    }
}

export const citizenService = new CitizenService()