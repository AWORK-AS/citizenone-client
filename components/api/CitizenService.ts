import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenService extends BaseAPIService {
    async getCitizens(params: object): Promise<any> {
        return await this.request(`/user/citizens`, 'GET', params)
    }

    async getCitizen(citizenUuid: any): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}`, 'GET')
    }

    async saveCitizen(params: object): Promise<any> {
        return await this.request(`/user/citizens`, 'POST', params)
    }

    async updateCitizen(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/update`, 'POST', params)
    }

    async getAllCitizens(): Promise<any> {
        return await this.request(`/user/citizens/all/list`, 'GET')
    }

    async getAllAvailableCitizens(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/available-citizens`, 'GET', params)
    }
}

export const citizenService = new CitizenService()