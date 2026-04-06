import BaseAPIService from '@/components/api/BaseAPIService'

class InvoiceService extends BaseAPIService {
    async getInvoices(params: object): Promise<any> {
        return await this.request(`/superadmin/invoices`, 'GET', params)
    }

    async getInvoiceDetails(invoiceUuid: any): Promise<any> {
        return await this.request(`/superadmin/invoices/${invoiceUuid}`, 'GET')
    }

    async downloadInvoices(params: object): Promise<any> {
        return await this.request(`/superadmin/invoices/download/report`, 'GET', params)
    }

    async downloadInvoiceDetails(invoiceUuid: any): Promise<any> {
        return await this.request(`/superadmin/invoices/${invoiceUuid}/download`, 'GET')
    }
}

export const invoiceService = new InvoiceService()