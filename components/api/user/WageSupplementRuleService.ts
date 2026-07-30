import BaseAPIService from '@/components/api/BaseAPIService'

class WageSupplementRuleService extends BaseAPIService {
    async getRules(): Promise<any> {
        return await this.request(`/user/wage-supplement-rules`, 'GET')
    }

    async saveRule(params: object): Promise<any> {
        return await this.request(`/user/wage-supplement-rules`, 'POST', params)
    }

    async updateRule(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/wage-supplement-rules/${uuid}`, 'PUT', params)
    }

    async deleteRule(uuid: any): Promise<any> {
        return await this.request(`/user/wage-supplement-rules/${uuid}`, 'DELETE')
    }
}

export const wageSupplementRuleService = new WageSupplementRuleService()
