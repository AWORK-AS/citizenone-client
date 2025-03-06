import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenProtocolService extends BaseAPIService {
    async getCitizenProtocols(params: object): Promise<any> {
        return await this.request(`/user/citizen-protocols`, 'GET', params)
    }

    async updateCitizenProtocol(citizenProtocolUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-protocols/${citizenProtocolUuid}`, 'PUT', params)
    }

    async deleteCitizenProtocol(citizenProtocolUuid: any): Promise<any> {
        return await this.request(`/user/citizen-protocols/${citizenProtocolUuid}`, 'DELETE')
    }
}

export const citizenProtocolService = new CitizenProtocolService()