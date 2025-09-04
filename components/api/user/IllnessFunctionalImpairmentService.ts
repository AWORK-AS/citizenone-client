import BaseAPIService from '@/components/api/BaseAPIService'

class IllnessFunctionalImpairmentService extends BaseAPIService {
    async getIllnessFunctionalImpairments(params: object): Promise<any> {
        return await this.request(`/user/illness-functional-impairment`, 'GET', params)
    }

    async getIllnessFunctionalImpairment(illnessFunctionalImpairmentUuid: any): Promise<any> {
        return await this.request(`/user/illness-functional-impairment/${illnessFunctionalImpairmentUuid}`, 'GET')
    }

    async saveIllnessFunctionalImpairment(params: object): Promise<any> {
        return await this.request(`/user/illness-functional-impairment`, 'POST', params)
    }

    async updateIllnessFunctionalImpairment(illnessFunctionalImpairmentUuid: any, params: object): Promise<any> {
        return await this.request(`/user/illness-functional-impairment/${illnessFunctionalImpairmentUuid}`, 'PUT', params)
    }

    async deleteIllnessFunctionalImpairment(illnessFunctionalImpairmentUuid: any): Promise<any> {
        return await this.request(`/user/illness-functional-impairment/${illnessFunctionalImpairmentUuid}`, 'DELETE')
    }
}

export const illnessFunctionalImpairmentService = new IllnessFunctionalImpairmentService()