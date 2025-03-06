import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenService extends BaseAPIService {
    async getCitizens(params: object): Promise<any> {
        return await this.request(`/relative/citizens`, 'GET', params)
    }

    async getCitizen(citizenUuid: any): Promise<any> {
        return await this.request(`/relative/citizens/${citizenUuid}`, 'GET')
    }
}

export const citizenService = new CitizenService()