import BaseAPIService from '@/components/api/user/BaseAPIService'

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

    async uploadUseOfForceAttachment(useOfForceUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-use-of-force/${useOfForceUuid}/upload-attachment`, 'POST', params)
    }

    async deleteUseOfForceAttachment(useOfForceUuid: any): Promise<any> {
        return await this.request(`/user/citizen-use-of-force/${useOfForceUuid}/remove-attachment`, 'PUT')
    }

    async downloadUseOfForceAttachment(useOfForceUuid: any): Promise<any> {
        return await this.request(`/user/citizen-use-of-force/${useOfForceUuid}/download-attachment`, 'GET')
    }
}

export const useOfForceService = new UseOfForceService()