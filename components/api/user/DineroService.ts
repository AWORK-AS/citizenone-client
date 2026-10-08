import BaseAPIService from '@/components/api/BaseAPIService'

class DineroService extends BaseAPIService {
    async getStatus(): Promise<any> {
        return await this.request(`/user/dinero`, 'GET')
    }

    async connect(clientId: string, clientSecret: string, apiKey: string): Promise<any> {
        return await this.request(`/user/dinero/connect`, 'POST', {
            client_id: clientId,
            client_secret: clientSecret,
            api_key: apiKey,
        })
    }

    async disconnect(): Promise<any> {
        return await this.request(`/user/dinero/connect`, 'DELETE')
    }

    async pushInvoice(invoiceUuid: string): Promise<any> {
        return await this.request(`/user/dinero/invoices/${invoiceUuid}/push`, 'POST')
    }
}

export const dineroService = new DineroService()
