import BaseAPIService from '@/components/api/BaseAPIService'

class InvoiceReceiverService extends BaseAPIService {
    async getInvoiceReceivers(params: object): Promise<any> {
        return await this.request(`/user/invoice-receivers`, 'GET', params)
    }

    async getInvoiceReceiver(invoiceReceiverUuid: any): Promise<any> {
        return await this.request(`/user/invoice-receivers/${invoiceReceiverUuid}`, 'GET')
    }

    async saveInvoiceReceiver(params: object): Promise<any> {
        return await this.request(`/user/invoice-receivers`, 'POST', params)
    }

    async updateInvoiceReceiver(invoiceReceiverUuid: any, params: object): Promise<any> {
        return await this.request(`/user/invoice-receivers/${invoiceReceiverUuid}`, 'PUT', params)
    }

    async deleteInvoiceReceiver(invoiceReceiverUuid: any): Promise<any> {
        return await this.request(`/user/invoice-receivers/${invoiceReceiverUuid}`, 'DELETE')
    }

    async getAutoSendSetting(): Promise<any> {
        return await this.request(`/user/invoice-receivers/settings`, 'GET')
    }

    async updateAutoSendSetting(autoSend: boolean): Promise<any> {
        return await this.request(`/user/invoice-receivers/settings`, 'PUT', { auto_send_invoices_to_accountant: autoSend })
    }
}

export const invoiceReceiverService = new InvoiceReceiverService()