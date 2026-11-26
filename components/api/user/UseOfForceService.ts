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

    async uploadUseOfForceAttachment(useOfForceUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-use-of-force/${useOfForceUuid}/upload-attachment`, 'POST', params)
    }

    async deleteUseOfForceAttachment(useOfForceUuid: any): Promise<any> {
        return await this.request(`/user/citizen-use-of-force/${useOfForceUuid}/remove-attachment`, 'PUT')
    }

    async downloadUseOfForceAttachment(useOfForceUuid: any): Promise<any> {
        return await this.request(`/user/citizen-use-of-force/${useOfForceUuid}/download-attachment`, 'GET')
    }

    // Roadmap #396: xlsx/csv of one citizen (citizen_uuid) or every citizen the user can see.
    async exportRecords(params: object, onHeaders?: (headers: Headers) => void): Promise<Blob | null> {
        return await this.requestBlob(`/user/citizen-use-of-force/export`, 'GET', params, onHeaders)
    }
}

export const useOfForceService = new UseOfForceService()