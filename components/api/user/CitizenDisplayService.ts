import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenDisplayService extends BaseAPIService {
    async getAllCitizenDisplay(): Promise<any> {
        return await this.request(`/user/citizen-displays/all/list`, 'GET')
    }
}

export const citizenDisplayService = new CitizenDisplayService()