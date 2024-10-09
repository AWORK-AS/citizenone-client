import BaseAPIService from '@/components/api/BaseAPIService'

class UseOfForceService extends BaseAPIService {
    async getUseOfForces(params: object): Promise<any> {
        return await this.request(`/user/citizen-use-of-force`, 'GET', params)
    }

    async getUseOfForce(useOfForceUuid: any): Promise<any> {
        return await this.request(`/user/citizen-use-of-force/${useOfForceUuid}`, 'GET')
    }

    async saveUseOfForce(params: object): Promise<any> {
        return await this.request(`/user/citizen-use-of-force`, 'POST', params)
    }

    async updateUseOfForce(useOfForceUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-use-of-force/${useOfForceUuid}`, 'PUT', params)
    }

    async uploadUseOfForceFile(params: object): Promise<any> {
        return await this.request(`/user/citizen-use-of-force-attachments`, 'POST', params)
    }
}

export const useOfForceService = new UseOfForceService()