import BaseAPIService from '@/components/api/BaseAPIService'

class EpikriseService extends BaseAPIService {
    async getEpikriserByCitizen(citizenUuid: any, params: object = {}): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/epikriser`, 'GET', params)
    }

    async saveEpikrise(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/epikriser`, 'POST', params)
    }

    async getEpikrise(uuid: any): Promise<any> {
        return await this.request(`/user/epikriser/${uuid}`, 'GET')
    }

    async updateEpikrise(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/epikriser/${uuid}`, 'PUT', params)
    }

    async deleteEpikrise(uuid: any): Promise<any> {
        return await this.request(`/user/epikriser/${uuid}`, 'DELETE')
    }

    // Replaces the body with the template/skeleton, so callers confirm first.
    async prefillEpikrise(uuid: any, params: object = {}): Promise<any> {
        return await this.request(`/user/epikriser/${uuid}/prefill`, 'POST', params)
    }

    async finalizeEpikrise(uuid: any): Promise<any> {
        return await this.request(`/user/epikriser/${uuid}/finalize`, 'POST')
    }

    async sendEpikrise(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/epikriser/${uuid}/send`, 'POST', params)
    }

    // Works for drafts (preview) and finalized epikriser.
    async getEpikrisePdf(uuid: any): Promise<Blob | null> {
        return await this.requestBlob(`/user/epikriser/${uuid}/pdf`, 'GET')
    }
}

export const epikriseService = new EpikriseService()
