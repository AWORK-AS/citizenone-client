import BaseAPIService from '@/components/api/user/BaseAPIService'

class MunicipalityService extends BaseAPIService {
    async getAllMunicipalitiesPerRegion(params: object): Promise<any> {
        return await this.request(`/user/municipalities`, 'GET', params)
    }

    async getAllMunicipalities(): Promise<any> {
        return await this.request(`/user/municipalities/all/list`, 'GET')
    }
}

export const municipalityService = new MunicipalityService()