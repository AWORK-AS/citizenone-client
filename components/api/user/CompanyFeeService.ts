import BaseAPIService from '@/components/api/BaseAPIService'

class CompanyFeeService extends BaseAPIService {
    async getCompanyFees(): Promise<any> {
        return await this.request(`/user/company-fees`, 'GET')
    }
}

export const companyFeeService = new CompanyFeeService()
