import BaseAPIService from '@/components/api/BaseAPIService'

class MunicipalityService extends BaseAPIService {
    async getAllMunicipalities(params: object): Promise<any> {
        return await this.request(`/user/municipalities`, 'GET', params)
    }
}

export const municipalityService = new MunicipalityService()