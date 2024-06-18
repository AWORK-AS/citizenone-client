import BaseAPIService from '@/components/api/BaseAPIService'

class ProtocolService extends BaseAPIService {
    async getProtocols(params: object): Promise<any> {
        return await this.request(`/user/protocols`, 'GET', params)
    }

    async getProtocol(protocolUuid: any): Promise<any> {
        return await this.request(`/user/protocols/${protocolUuid}`, 'GET')
    }

    async saveProtocol(params: object): Promise<any> {
        return await this.request(`/user/protocols`, 'POST', params)
    }

    async updateProtocol(protocolUuid: any, params: object): Promise<any> {
        return await this.request(`/user/protocols/${protocolUuid}`, 'PUT', params)
    }

    async getCitizenProtocols(protocolUuid: any, params: object): Promise<any> {
        return await this.request(`/user/protocols/${protocolUuid}/citizen-protocols`, 'GET', params)
    }
}

export const protocolService = new ProtocolService()