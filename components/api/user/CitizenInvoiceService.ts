import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenInvoiceService extends BaseAPIService {
    async getServices(): Promise<any> {
        return await this.request(`/user/services`, 'GET')
    }

    async createService(params: object): Promise<any> {
        return await this.request(`/user/services`, 'POST', params)
    }

    async updateService(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/services/${uuid}`, 'PUT', params)
    }

    async deleteService(uuid: string): Promise<any> {
        return await this.request(`/user/services/${uuid}`, 'DELETE')
    }

    async getForCitizen(citizenUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/invoices`, 'GET')
    }

    async getForCompany(params: object): Promise<any> {
        return await this.request(`/user/citizen-invoices`, 'GET', params)
    }

    async createInvoice(citizenUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/invoices`, 'POST', params)
    }

    async updateInvoice(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizen-invoices/${uuid}`, 'PUT', params)
    }

    async updateStatus(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizen-invoices/${uuid}/status`, 'PUT', params)
    }

    async addPayment(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizen-invoices/${uuid}/payments`, 'POST', params)
    }

    async deleteInvoice(uuid: string): Promise<any> {
        return await this.request(`/user/citizen-invoices/${uuid}`, 'DELETE')
    }
}

export const citizenInvoiceService = new CitizenInvoiceService()
