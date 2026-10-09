import BaseAPIService from '@/components/api/BaseAPIService'

class ProtocolService extends BaseAPIService {
    async getProtocols(params: object): Promise<any> {
        return await this.request(`/user/protocols`, 'GET', params)
    }

    // Name and uuid of every protocol, for pickers.
    async getProtocolList(): Promise<any> {
        return await this.request(`/user/protocols/all/list`, 'GET')
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

    async deleteProtocol(protocolUuid: any): Promise<any> {
        return await this.request(`/user/protocols/${protocolUuid}`, 'DELETE')
    }

    async downloadProtocol(citizenProtocolUuid: any, params: object): Promise<any> {
        return await this.request(`/user/protocols/${citizenProtocolUuid}/download`, 'GET', params)
    }

    async getCitizenProtocols(protocolUuid: any, params: object): Promise<any> {
        return await this.request(`/user/protocols/${protocolUuid}/citizen-protocols`, 'GET', params)
    }

    async getProtocolsByCitizen(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/protocols`, 'GET', params)
    }

    async getCitizenProtocolsByCitizen(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/citizen-protocols`, 'GET', params)
    }

    async getCitizenProtocolsCount(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/citizen-protocols-count`, 'GET', params)
    }
}

export const protocolService = new ProtocolService()