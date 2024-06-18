import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenProtocolService extends BaseAPIService {
    async getCitizenProtocols(params: object): Promise<any> {
        return await this.request(`/user/citizen-protocols`, 'GET', params)
    }
}

export const citizenProtocolService = new CitizenProtocolService()