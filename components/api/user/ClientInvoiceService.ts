import BaseAPIService from '@/components/api/BaseAPIService'

class ClientInvoiceService extends BaseAPIService {
    async getClientInvoices(params: object): Promise<any> {
        return await this.request(`/user/client-invoices`, 'GET', params)
    }

    async getClientInvoiceDetails(clientInvoiceUuid: any): Promise<any> {
        return await this.request(`/user/client-invoices/${clientInvoiceUuid}`, 'GET')
    }

    async downloadClientInvoiceDetails(clientInvoiceUuid: any): Promise<any> {
        return await this.request(`/user/client-invoices/${clientInvoiceUuid}/download`, 'GET')
    }
}

export const clientInvoiceService = new ClientInvoiceService()