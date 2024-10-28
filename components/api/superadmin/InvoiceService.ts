import BaseAPIService from '@/components/api/BaseAPIService'

class InvoiceService extends BaseAPIService {
    async getInvoices(params: object): Promise<any> {
        return await this.request(`/superadmin/invoices`, 'GET', params)
    }

    async getInvoiceDetails(invoceUuid: any): Promise<any> {
        return await this.request(`/superadmin/invoices/${invoceUuid}`, 'GET')
    }

    async downloadInvoiceDetails(invoceUuid: any): Promise<any> {
        return await this.request(`/superadmin/invoices/${invoceUuid}/download`, 'GET')
    }
}

export const invoiceService = new InvoiceService()