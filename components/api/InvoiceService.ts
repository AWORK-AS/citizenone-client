import BaseAPIService from '@/components/api/BaseAPIService'

class InvoiceService extends BaseAPIService {
    async getInvoices(params: object): Promise<any> {
        return await this.request(`/user/invoices`, 'GET', params)
    }

    async getInvoiceDetails(invoiceUuid: any): Promise<any> {
        return await this.request(`/user/invoices/${invoiceUuid}`, 'GET')
    }

    async downloadInvoiceDetails(invoiceUuid: any): Promise<any> {
        return await this.request(`/user/invoices/${invoiceUuid}/download`, 'GET')
    }

    async sendInvoice(invoiceUuid: any): Promise<any> {
        return await this.request(`/user/invoices/${invoiceUuid}/send`, 'POST')
    }

    async sendAllInvoice(): Promise<any> {
        return await this.request(`/user/invoices/send/all`, 'POST')
    }
}

export const invoiceService = new InvoiceService()