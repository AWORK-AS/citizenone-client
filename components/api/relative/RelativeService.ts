import BaseAPIService from '@/components/api/user/BaseAPIService'

class CitizenService extends BaseAPIService {
    async getCurrentLoggedInCitizen(): Promise<any> {
        return await this.request(`/relative`, 'GET')
    }

    async updateCitizenLangugage(params: object): Promise<any> {
        return await this.request(`/relative/update/language`, 'PUT', params)
    }
}

export const citizenService = new CitizenService()