import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenService extends BaseAPIService {
    async getCitizens(params: object): Promise<any> {
        return await this.request(`/user/citizens`, 'GET', params)
    }

    async saveCitizen(params: object): Promise<any> {
        return await this.request(`/user/citizens`, 'POST', params)
    }
}

export const citizenService = new CitizenService()