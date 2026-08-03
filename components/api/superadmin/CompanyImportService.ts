import BaseAPIService from '@/components/api/BaseAPIService'

class CompanyImportService extends BaseAPIService {
    async importCitizens(companyUuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/imports/citizens`, 'POST', params)
    }
    async getImportBatches(companyUuid: string): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/imports/batches`, 'GET')
    }
    async undoImport(companyUuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/imports/undo`, 'POST', params)
    }
}

export const companyImportService = new CompanyImportService()
