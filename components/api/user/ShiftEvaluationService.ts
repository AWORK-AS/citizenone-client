import BaseAPIService from '@/components/api/BaseAPIService'

class ShiftEvaluationService extends BaseAPIService {
    async getPending(): Promise<any> {
        return await this.request(`/user/shift-evaluations/pending`, 'GET')
    }

    async getMine(): Promise<any> {
        return await this.request(`/user/shift-evaluations`, 'GET')
    }

    async getForCompany(params: object): Promise<any> {
        return await this.request(`/user/shift-evaluations/company`, 'GET', params)
    }

    async saveEvaluation(params: object): Promise<any> {
        return await this.request(`/user/shift-evaluations`, 'POST', params)
    }

    async deleteEvaluation(uuid: any): Promise<any> {
        return await this.request(`/user/shift-evaluations/${uuid}`, 'DELETE')
    }
}

export const shiftEvaluationService = new ShiftEvaluationService()
