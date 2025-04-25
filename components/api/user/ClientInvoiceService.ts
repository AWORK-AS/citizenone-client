import BaseAPIService from '@/components/api/BaseAPIService'

class ClientInvoiceService extends BaseAPIService {
    async getClientInvoices(params: object): Promise<any> {
        return await this.request(`/user/client-invoices`, 'GET', params)
    }

    async getClientInvoiceDetails(clientInvoiceUuid: any): Promise<any> {
        return await this.request(`/user/client-invoices/${clientInvoiceUuid}`, 'GET')
    }

    async saveClientInvoice(params: object): Promise<any> {
        return await this.request(`/user/client-invoices`, 'POST', params)
    }

    async updateClientInvoice(clientInvoiceUuid: any, params: object): Promise<any> {
        return await this.request(`/user/client-invoices/${clientInvoiceUuid}`, 'PUT', params)
    }

    async sendClientInvoiceDetails(clientInvoiceUuid: any): Promise<any> {
        return await this.request(`/user/client-invoices/${clientInvoiceUuid}/send`, 'POST')
    }

    async downloadClientInvoiceDetails(clientInvoiceUuid: any): Promise<any> {
        return await this.request(`/user/client-invoices/${clientInvoiceUuid}/download`, 'GET')
    }
}

export const clientInvoiceService = new ClientInvoiceService()