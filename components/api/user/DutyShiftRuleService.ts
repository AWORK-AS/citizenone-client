import BaseAPIService from '@/components/api/BaseAPIService'

class DutyShiftRuleService extends BaseAPIService {
    async getRules(params: object): Promise<any> {
        return await this.request(`/user/duty-shift-rules`, 'GET', params)
    }

    async getRule(uuid: any): Promise<any> {
        return await this.request(`/user/duty-shift-rules/${uuid}`, 'GET')
    }

    async saveRule(params: object): Promise<any> {
        return await this.request(`/user/duty-shift-rules`, 'POST', params)
    }

    async updateRule(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/duty-shift-rules/${uuid}`, 'PUT', params)
    }

    async deleteRule(uuid: any): Promise<any> {
        return await this.request(`/user/duty-shift-rules/${uuid}`, 'DELETE')
    }
}

export const dutyShiftRuleService = new DutyShiftRuleService()
