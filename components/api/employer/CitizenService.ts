import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenService extends BaseAPIService {
    async getCitizens(): Promise<any> {
        return await this.request(`/employer/citizens`, 'GET')
    }
}

export const citizenService = new CitizenService()
