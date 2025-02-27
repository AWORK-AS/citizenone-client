import BaseAPIService from '@/components/api/user/BaseAPIService'

class TreatmentService extends BaseAPIService {
    async getTreatments(params: object): Promise<any> {
        return await this.request(`/user/treatments`, 'GET', params)
    }

    async saveTreatment(params: object): Promise<any> {
        return await this.request(`/user/treatments`, 'POST', params)
    }

    async updateTreatment(treatmentUuid: any, params: object): Promise<any> {
        return await this.request(`/user/treatments/${treatmentUuid}`, 'PUT', params)
    }

    async deleteTreatment(treatmentUuid: any): Promise<any> {
        return await this.request(`/user/treatments/${treatmentUuid}`, 'DELETE')
    }
}

export const treatmentService = new TreatmentService()