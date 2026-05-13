import BaseAPIService from '@/components/api/BaseAPIService'

class EffectEvaluationService extends BaseAPIService {
    async getEffectEvaluations(params: object): Promise<any> {
        return await this.request(`/user/effect-evaluations`, 'GET', params)
    }

    async saveEffectEvaluation(params: object): Promise<any> {
        return await this.request(`/user/effect-evaluations`, 'POST', params)
    }

    async updateEffectEvaluation(effectEvaluationUuid: string, params: object): Promise<any> {
        return await this.request(`/user/effect-evaluations/${effectEvaluationUuid}`, 'PUT', params)
    }

    async deleteEffectEvaluation(effectEvaluationUuid: string): Promise<any> {
        return await this.request(`/user/effect-evaluations/${effectEvaluationUuid}`, 'DELETE')
    }
}

export const effectEvaluationService = new EffectEvaluationService()
