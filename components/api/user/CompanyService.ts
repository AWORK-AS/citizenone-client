import BaseAPIService from '@/components/api/BaseAPIService'

class CompanyService extends BaseAPIService {
    async getAllCompanies(): Promise<any> {
        return await this.request(`/user/companies/all/list`, 'GET')
    }

    async updateOnboardingPreferences(params: object): Promise<any> {
        return await this.request(`/user/company/onboarding-preferences`, 'PUT', params)
    }
}

export const companyService = new CompanyService()