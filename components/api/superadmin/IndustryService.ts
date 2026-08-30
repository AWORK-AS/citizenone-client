import BaseAPIService from '@/components/api/BaseAPIService'

class IndustryService extends BaseAPIService {
    async getAllIndustries(): Promise<any> {
        return await this.request(`/superadmin/industries/all/list`, 'GET')
    }

    async getCompanyIndustryDefaults(companyUuid: string): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/industry-defaults`, 'GET')
    }

    async applyCompanyIndustryDefaults(companyUuid: string): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/industry-defaults`, 'POST')
    }

    async revertCompanyIndustryDefaults(companyUuid: string): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/industry-defaults`, 'DELETE')
    }
}

export const industryService = new IndustryService()