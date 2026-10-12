import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenProtocolService extends BaseAPIService {
    async getProtocols(params: object): Promise<any> {
        return await this.request(`/citizen/protocols`, 'GET', params)
    }

    // Task 136: the citizen's own clip cards, read-only.
    async getClipCards(): Promise<any> {
        return await this.request(`/citizen/protocols/clip-cards`, 'GET')
    }

    async getProtocol(uuid: string): Promise<any> {
        return await this.request(`/citizen/protocols/${uuid}`, 'GET')
    }

    async checkIn(uuid: string): Promise<any> {
        return await this.request(`/citizen/protocols/${uuid}/check-in`, 'PUT')
    }

    async checkOut(uuid: string): Promise<any> {
        return await this.request(`/citizen/protocols/${uuid}/check-out`, 'PUT')
    }
}

export const citizenProtocolService = new CitizenProtocolService()
