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
        // Only sent where the company lets mileage follow the transport grant.
        mileage_follows_transport?: boolean
    }): Promise<any> {
        return await this.request(base(target, uuid), 'PUT', params)
    }

    // One consultant's own rule on the case. Null follows the case (yes/no)
    // or sets no limit; all null removes it.
    async saveUserRule(target: RuleTarget, uuid: string, userUuid: string, params: UserRule): Promise<any> {
        return await this.request(`${base(target, uuid)}/users/${userUuid}`, 'PUT', params)
    }

    async deleteUserRule(target: RuleTarget, uuid: string, userUuid: string): Promise<any> {
        return await this.request(`${base(target, uuid)}/users/${userUuid}`, 'DELETE')
    }
}

export type UserRule = {
    mileage_allowed: boolean | null
    expenses_allowed: boolean | null
    mileage_monthly_km_limit: number | null
    expenses_monthly_amount_limit: number | null
}

export const emptyUserRule = (): UserRule => ({
    mileage_allowed: null,
    expenses_allowed: null,
    mileage_monthly_km_limit: null,
    expenses_monthly_amount_limit: null,
})

// Whether a consultant's rule says anything of its own.
export const userRuleIsSet = (rule: UserRule | null | undefined): boolean =>
    !!rule && Object.values(rule).some((value) => value !== null && value !== '' && value !== undefined)

export const registrationRuleService = new RegistrationRuleService()

// What the form edits: yes/no as a choice that can follow the case, limits as
// the text a number field holds.
export type UserRuleDraft = {
    mileage: 'case' | 'yes' | 'no'
    expenses: 'case' | 'yes' | 'no'
    km_limit: string
    amount_limit: string
}

const choice = (value: boolean | null | undefined): 'case' | 'yes' | 'no' =>
    value === true ? 'yes' : value === false ? 'no' : 'case'

const answer = (value: 'case' | 'yes' | 'no'): boolean | null =>
    value === 'yes' ? true : value === 'no' ? false : null

const limit = (value: string): number | null => {
    const number = Number(String(value ?? '').replace(',', '.'))

    return String(value ?? '').trim() === '' || !Number.isFinite(number) || number < 0 ? null : number
}

export const toUserRuleDraft = (rule: UserRule | null | undefined): UserRuleDraft => ({
    mileage: choice(rule?.mileage_allowed),
    expenses: choice(rule?.expenses_allowed),
    km_limit: rule?.mileage_monthly_km_limit != null ? String(rule.mileage_monthly_km_limit) : '',
    amount_limit: rule?.expenses_monthly_amount_limit != null ? String(rule.expenses_monthly_amount_limit) : '',
})

export const fromUserRuleDraft = (draft: UserRuleDraft): UserRule => ({
    mileage_allowed: answer(draft.mileage),
    expenses_allowed: answer(draft.expenses),
    mileage_monthly_km_limit: limit(draft.km_limit),
    expenses_monthly_amount_limit: limit(draft.amount_limit),
})
