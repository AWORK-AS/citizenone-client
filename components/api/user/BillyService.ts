import BaseAPIService from '@/components/api/BaseAPIService'

class BillyService extends BaseAPIService {
    async getStatus(): Promise<any> {
        return await this.request(`/user/billy`, 'GET')
    }

    async connect(apiToken: string): Promise<any> {
        return await this.request(`/user/billy/connect`, 'POST', {
            api_token: apiToken,
        })
    }

    async disconnect(): Promise<any> {
        return await this.request(`/user/billy/connect`, 'DELETE')
    }

    async pushInvoice(invoiceUuid: string): Promise<any> {
        return await this.request(`/user/billy/invoices/${invoiceUuid}/push`, 'POST')
    }
}

export const billyService = new BillyService()
