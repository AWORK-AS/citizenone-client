import BaseAPIService from '@/components/api/BaseAPIService'

class CompanyService extends BaseAPIService {
    async getAllCompanies(): Promise<any> {
        return await this.request(`/user/companies/all/list`, 'GET')
    }

    async updateOnboardingPreferences(params: object): Promise<any> {
        return await this.request(`/user/company/onboarding-preferences`, 'PUT', params)
    }

    // "How many are you?" on /discover: solo, 2-4, 5-10 or 11+.
    async updateTeamSize(params: { team_size: string }): Promise<any> {
        return await this.request(`/user/company/team-size`, 'PUT', params)
    }

    async updateConsultantStepCount(params: object): Promise<any> {
        return await this.request(`/user/company/consultant-step-count`, 'PUT', params)
    }

    async getCompanyModules(): Promise<any> {
        return await this.request(`/user/company/modules`, 'GET')
    }

    async updateCompanyModules(params: object): Promise<any> {
        return await this.request(`/user/company/modules`, 'PUT', params)
    }
}

export const companyService = new CompanyService()