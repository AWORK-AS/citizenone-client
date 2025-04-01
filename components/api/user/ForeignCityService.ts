import BaseAPIService from '@/components/api/BaseAPIService'

class ForeignCityService extends BaseAPIService {
    async getForeignCities(params: object): Promise<any> {
        return await this.request(`/user/foreign-cities`, 'GET', params)
    }

    async getForeignCity(foreignCityUuid: any): Promise<any> {
        return await this.request(`/user/foreign-cities/${foreignCityUuid}`, 'GET')
    }

    async saveForeignCity(params: object): Promise<any> {
        return await this.request(`/user/foreign-cities`, 'POST', params)
    }

    async updateForeignCity(foreignCityUuid: any, params: object): Promise<any> {
        return await this.request(`/user/foreign-cities/${foreignCityUuid}`, 'PUT', params)
    }

    async deleteForeignCity(foreignCityUuid: any): Promise<any> {
        return await this.request(`/user/foreign-cities/${foreignCityUuid}`, 'DELETE')
    }

    async getAllForeignCities(): Promise<any> {
        return await this.request(`/user/foreign-cities/all/list`, 'GET')
    }
}

export const foreignCityService = new ForeignCityService()