import BaseAPIService from '@/components/api/BaseAPIService'

class CityService extends BaseAPIService {
    async getAllCities(params: object): Promise<any> {
        return await this.request(`/user/cities`, 'GET', params)
    }
}

export const cityService = new CityService()