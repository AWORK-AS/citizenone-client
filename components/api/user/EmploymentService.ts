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

class EmploymentJobcenterService extends BaseAPIService {
    async getJobcenters(params: object): Promise<any> {
        return await this.request(`/user/employment/jobcenters`, 'GET', params)
    }

    async getJobcenter(uuid: any): Promise<any> {
        return await this.request(`/user/employment/jobcenters/${uuid}`, 'GET')
    }

    async saveJobcenter(params: object): Promise<any> {
        return await this.request(`/user/employment/jobcenters`, 'POST', params)
    }

    async updateJobcenter(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/employment/jobcenters/${uuid}`, 'PUT', params)
    }

    async deleteJobcenter(uuid: any): Promise<any> {
        return await this.request(`/user/employment/jobcenters/${uuid}`, 'DELETE')
    }

    async getAllJobcenters(): Promise<any> {
        return await this.request(`/user/employment/jobcenters/all/list`, 'GET')
    }
}

class EmploymentAgreementService extends BaseAPIService {
    async getAgreements(params: object): Promise<any> {
        return await this.request(`/user/employment/agreements`, 'GET', params)
    }

    async getAgreement(uuid: any): Promise<any> {
        return await this.request(`/user/employment/agreements/${uuid}`, 'GET')
    }

    async saveAgreement(params: object): Promise<any> {
        return await this.request(`/user/employment/agreements`, 'POST', params)
    }

    async updateAgreement(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/employment/agreements/${uuid}`, 'PUT', params)
    }

    async deleteAgreement(uuid: any): Promise<any> {
        return await this.request(`/user/employment/agreements/${uuid}`, 'DELETE')
    }

    async getAllAgreements(): Promise<any> {
        return await this.request(`/user/employment/agreements/all/list`, 'GET')
    }
}

class EmploymentCaseService extends BaseAPIService {
    async getCases(params: object): Promise<any> {
        return await this.request(`/user/employment/cases`, 'GET', params)
    }

    async getCasesByCitizen(citizenUuid: any, params: object = {}): Promise<any> {
        return await this.request(`/user/employment/cases/citizen/${citizenUuid}`, 'GET', params)
    }

    async getCase(uuid: any): Promise<any> {
        return await this.request(`/user/employment/cases/${uuid}`, 'GET')
    }

    async saveCase(params: object): Promise<any> {
        return await this.request(`/user/employment/cases`, 'POST', params)
    }

    async updateCase(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/employment/cases/${uuid}`, 'PUT', params)
    }

    async deleteCase(uuid: any): Promise<any> {
        return await this.request(`/user/employment/cases/${uuid}`, 'DELETE')
    }
}

export const employmentStatusTypeService = new EmploymentStatusTypeService()
export const employmentCaseTypeService = new EmploymentCaseTypeService()
export const employmentBillingRuleService = new EmploymentBillingRuleService()
export const employmentJobcenterService = new EmploymentJobcenterService()
export const employmentAgreementService = new EmploymentAgreementService()
export const employmentCaseService = new EmploymentCaseService()
