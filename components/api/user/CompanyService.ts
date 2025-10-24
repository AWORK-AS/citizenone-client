import BaseAPIService from '@/components/api/BaseAPIService'

class CompanyService extends BaseAPIService {
    async getAllCompanies(): Promise<any> {
        return await this.request(`/user/companies/all/list`, 'GET')
    }
}

export const companyService = new CompanyService()