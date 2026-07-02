import BaseAPIService from '@/components/api/BaseAPIService'

class EconomicService extends BaseAPIService {
    async getStatus(): Promise<any> {
        return await this.request(`/user/economic`, 'GET')
    }

    async connect(): Promise<any> {
        return await this.request(`/user/economic/connect`, 'POST')
    }

    async disconnect(): Promise<any> {
        return await this.request(`/user/economic/connect`, 'DELETE')
    }

    async pushInvoice(invoiceUuid: string): Promise<any> {
        return await this.request(`/user/economic/invoices/${invoiceUuid}/push`, 'POST')
    }
}

export const economicService = new EconomicService()
