import BaseAPIService from '@/components/api/BaseAPIService'

class CompanyService extends BaseAPIService {
    async getCompanies(params: object): Promise<any> {
        return await this.request(`/superadmin/companies`, 'GET', params)
    }

    async getCompany(companyUuid: any): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}`, 'GET')
    }

    async saveCompany(params: object): Promise<any> {
        return await this.request(`/superadmin/companies`, 'POST', params)
    }

    async updateCompany(companyUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}`, 'PUT', params)
    }

    async activateDeactiveCompany(companyUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/update-status`, 'PUT', params)
    }

    async getCompanyApps(companyUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/apps`, 'GET', params)
    }

    async importCompanies(params: object): Promise<any> {
        return await this.request(`/superadmin/imports`, 'POST', params)
    }

    async downloadTemplate(): Promise<any> {
        return await this.request(`/superadmin/imports/download/template`, 'GET')
    }
}

export const companyService = new CompanyService()