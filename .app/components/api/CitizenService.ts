import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenService extends BaseAPIService {
    async getCitizens(params: object): Promise<any> {
        return await this.request(`/user/citizens`, 'GET', params)
    }

    async getCitizen(citizenId: number): Promise<any> {
        return await this.request(`/user/citizens/${citizenId}`, 'GET')
    }

    async saveCitizen(params: object): Promise<any> {
        return await this.request(`/user/citizens`, 'POST', params)
    }

    async updateCitizen(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/update`, 'POST', params)
    }
}

export const citizenService = new CitizenService()