import BaseAPIService from '@/components/api/BaseAPIService'

/**
 * Superadmin orders: several lines, one invoice, one fee, one e-conomic
 * draft for finance to book and send.
 */
class CompanyOrderService extends BaseAPIService {
    async list(params: object): Promise<any> {
        return await this.request(`/superadmin/company-orders`, 'GET', params)
    }

    async products(companyUuid: string): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/orders/products`, 'GET')
    }

    async create(companyUuid: string, params: object = {}): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/orders`, 'POST', params)
    }

    async show(orderUuid: string): Promise<any> {
        return await this.request(`/superadmin/company-orders/${orderUuid}`, 'GET')
    }

    async setTerm(orderUuid: string, term: string): Promise<any> {
        return await this.request(`/superadmin/company-orders/${orderUuid}`, 'PATCH', { term })
    }

    async addLine(orderUuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/company-orders/${orderUuid}/lines`, 'POST', params)
    }

    async updateLine(orderUuid: string, lineUuid: string, quantity: number): Promise<any> {
        return await this.request(`/superadmin/company-orders/${orderUuid}/lines/${lineUuid}`, 'PATCH', { quantity })
    }

    /** 0 removes the discount; above 0 needs a reason. */
    async setDiscount(orderUuid: string, lineUuid: string, params: { discount_percent: number; discount_reason: string | null; discount_on_renewal: boolean }): Promise<any> {
        return await this.request(`/superadmin/company-orders/${orderUuid}/lines/${lineUuid}/discount`, 'PUT', params)
    }

    async removeLine(orderUuid: string, lineUuid: string): Promise<any> {
        return await this.request(`/superadmin/company-orders/${orderUuid}/lines/${lineUuid}`, 'DELETE')
    }

    async complete(orderUuid: string): Promise<any> {
        return await this.request(`/superadmin/company-orders/${orderUuid}/complete`, 'POST')
    }

    async retry(orderUuid: string): Promise<any> {
        return await this.request(`/superadmin/company-orders/${orderUuid}/retry`, 'POST')
    }

    async cancel(orderUuid: string): Promise<any> {
        return await this.request(`/superadmin/company-orders/${orderUuid}/cancel`, 'POST')
    }
}

export const companyOrderService = new CompanyOrderService()
