import BaseAPIService from '@/components/api/BaseAPIService'

class EffectEvaluationService extends BaseAPIService {
    async getEffectEvaluations(params: object): Promise<any> {
        return await this.request(`/user/effect-evaluations`, 'GET', params)
    }

    async createEffectEvaluation(params: object): Promise<any> {
        return await this.request(`/user/effect-evaluations`, 'POST', params)
    }

    async updateEffectEvaluation(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/effect-evaluations/${uuid}`, 'PUT', params)
    }

    async deleteEffectEvaluation(uuid: string): Promise<any> {
        return await this.request(`/user/effect-evaluations/${uuid}`, 'DELETE')
    }
}

export const effectEvaluationService = new EffectEvaluationService()
