import BaseAPIService from '@/components/api/BaseAPIService'

class GeolocationService extends BaseAPIService {
    async getAllCountries(): Promise<any> {
        return await this.request(`/geolocation/countries`, 'GET')
    }

    async getAllRegions(): Promise<any> {
        return await this.request(`/geolocation/regions`, 'GET')
    }

    async getAllMunicipalities(params: object): Promise<any> {
        return await this.request(`/geolocation/municipalities`, 'GET', params)
    }

    async getAllCities(params: object): Promise<any> {
        return await this.request(`/geolocation/cities`, 'GET', params)
    }
}

export const geolocationService = new GeolocationService()