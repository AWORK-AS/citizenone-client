import BaseAPIService from '@/components/api/BaseAPIService'

class EmploymentService extends BaseAPIService {
    // Status Types
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

    // Case Types
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

    // Billing Rules
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

    // Jobcenters
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

    // Agreements
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

    // Cases
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

    // Agreement Status Types
    async getAgreementStatusTypes(agreementUuid: any): Promise<any> {
        return await this.request(`/user/employment/agreements/${agreementUuid}/status-types`, 'GET')
    }

    async updateAgreementStatusTypes(agreementUuid: any, params: object): Promise<any> {
        return await this.request(`/user/employment/agreements/${agreementUuid}/status-types`, 'PUT', params)
    }

    // Case Status History
    async getCaseStatusHistory(caseUuid: any, params: object = {}): Promise<any> {
        return await this.request(`/user/employment/cases/${caseUuid}/status-history`, 'GET', params)
    }

    async saveCaseStatusHistory(caseUuid: any, params: object): Promise<any> {
        return await this.request(`/user/employment/cases/${caseUuid}/status-history`, 'POST', params)
    }

    // Billing — Week-level tracking
    async getCaseBillingWeeks(caseUuid: string, params: object = {}): Promise<any> {
        return await this.request(`/user/employment/cases/${caseUuid}/billing-weeks`, 'GET', params)
    }

    async excludeWeekFromBilling(caseUuid: string, params: object): Promise<any> {
        return await this.request(`/user/employment/cases/${caseUuid}/billing-weeks/exclude`, 'POST', params)
    }

    async includeWeekInBilling(caseUuid: string, params: object): Promise<any> {
        return await this.request(`/user/employment/cases/${caseUuid}/billing-weeks/include`, 'POST', params)
    }

    // Billing — Extraction
    async getBillingExtraction(params: object): Promise<any> {
        return await this.request(`/user/employment/billing/extraction`, 'GET', params)
    }

    async markWeeksAsInvoiced(params: object): Promise<any> {
        return await this.request(`/user/employment/billing/mark-invoiced`, 'POST', params)
    }

    // Revenue — Consultant report
    async getRevenueReport(params: object): Promise<any> {
        return await this.request(`/user/employment/billing/revenue-report`, 'GET', params)
    }

    // Revenue split across primary/secondary coordinators
    async getCoordinatorEconomy(params: object): Promise<any> {
        return await this.request(`/user/employment/billing/coordinator-economy`, 'GET', params)
    }
}

export const employmentService = new EmploymentService()
