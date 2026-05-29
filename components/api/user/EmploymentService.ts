import BaseAPIService from '@/components/api/BaseAPIService'

class EmploymentStatusTypeService extends BaseAPIService {
    async getStatusTypes(params: object): Promise<any> {
        return await this.request(`/user/employment/status-types`, 'GET', params)
    }

    async getStatusType(uuid: any): Promise<any> {
        return await this.request(`/user/employment/status-types/${uuid}`, 'GET')
    }

    async saveStatusType(params: object): Promise<any> {
        return await this.request(`/user/employment/status-types`, 'POST', params)
    }

    async updateStatusType(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/employment/status-types/${uuid}`, 'PUT', params)
    }

    async deleteStatusType(uuid: any): Promise<any> {
        return await this.request(`/user/employment/status-types/${uuid}`, 'DELETE')
    }

    async getAllStatusTypes(): Promise<any> {
        return await this.request(`/user/employment/status-types/all/list`, 'GET')
    }
}

class EmploymentCaseTypeService extends BaseAPIService {
    async getCaseTypes(params: object): Promise<any> {
        return await this.request(`/user/employment/case-types`, 'GET', params)
    }

    async getCaseType(uuid: any): Promise<any> {
        return await this.request(`/user/employment/case-types/${uuid}`, 'GET')
    }

    async saveCaseType(params: object): Promise<any> {
        return await this.request(`/user/employment/case-types`, 'POST', params)
    }

    async updateCaseType(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/employment/case-types/${uuid}`, 'PUT', params)
    }

    async deleteCaseType(uuid: any): Promise<any> {
        return await this.request(`/user/employment/case-types/${uuid}`, 'DELETE')
    }

    async getAllCaseTypes(): Promise<any> {
        return await this.request(`/user/employment/case-types/all/list`, 'GET')
    }
}

class EmploymentBillingRuleService extends BaseAPIService {
    async getBillingRules(params: object): Promise<any> {
        return await this.request(`/user/employment/billing-rules`, 'GET', params)
    }

    async getBillingRule(uuid: any): Promise<any> {
        return await this.request(`/user/employment/billing-rules/${uuid}`, 'GET')
    }

    async saveBillingRule(params: object): Promise<any> {
        return await this.request(`/user/employment/billing-rules`, 'POST', params)
    }

    async updateBillingRule(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/employment/billing-rules/${uuid}`, 'PUT', params)
    }

    async deleteBillingRule(uuid: any): Promise<any> {
        return await this.request(`/user/employment/billing-rules/${uuid}`, 'DELETE')
    }

    async getAllBillingRules(): Promise<any> {
        return await this.request(`/user/employment/billing-rules/all/list`, 'GET')
    }
}

export const employmentStatusTypeService = new EmploymentStatusTypeService()
export const employmentCaseTypeService = new EmploymentCaseTypeService()
export const employmentBillingRuleService = new EmploymentBillingRuleService()
