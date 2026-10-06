import BaseAPIService from '@/components/api/BaseAPIService'

export type RuleTarget = 'citizen' | 'inquiry'

const base = (target: RuleTarget, uuid: string) =>
    target === 'citizen' ? `/user/citizens/${uuid}/registration-rules` : `/user/citizen-inquiries/${uuid}/registration-rules`

class RegistrationRuleService extends BaseAPIService {
    async getVisitTypes(activeOnly = false): Promise<any> {
        return await this.request(`/user/visit-types`, 'GET', activeOnly ? { active: 1 } : undefined)
    }

    async saveVisitType(params: object): Promise<any> {
        return await this.request(`/user/visit-types`, 'POST', params)
    }

    async updateVisitType(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/visit-types/${uuid}`, 'PUT', params)
    }

    async deleteVisitType(uuid: string): Promise<any> {
        return await this.request(`/user/visit-types/${uuid}`, 'DELETE')
    }

    async reorderVisitTypes(uuids: string[]): Promise<any> {
        return await this.request(`/user/visit-types/reorder`, 'PUT', { uuids })
    }

    async getRules(target: RuleTarget, uuid: string): Promise<any> {
        return await this.request(base(target, uuid), 'GET')
    }

    async saveRules(target: RuleTarget, uuid: string, params: {
        allowed_visit_type_uuids: string[] | null
        mileage_allowed: boolean
        expenses_allowed: boolean
    }): Promise<any> {
        return await this.request(base(target, uuid), 'PUT', params)
    }
}

export const registrationRuleService = new RegistrationRuleService()
