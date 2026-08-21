import BaseAPIService from '@/components/api/BaseAPIService'

class SocialWelfareService extends BaseAPIService {
    // Revenue split across primary/secondary case workers (coordinators)
    async getCoordinatorEconomy(params: object): Promise<any> {
        return await this.request(`/user/social-welfare/coordinator-economy`, 'GET', params)
    }

    // Delivered hours per citizen for a period, grouped by paying municipality
    async getBillingExtraction(params: object): Promise<any> {
        return await this.request(`/user/social-welfare/billing-extraction`, 'GET', params)
    }

    // The individual hour registrations behind one extraction row
    async getBillingRegistrations(params: object): Promise<any> {
        return await this.request(`/user/social-welfare/billing-extraction/registrations`, 'GET', params)
    }

    // Turns extraction rows into client invoices, one per municipality
    async convertToInvoices(payload: object): Promise<any> {
        return await this.request(`/user/social-welfare/billing-extraction/invoices`, 'POST', payload)
    }
}

export const socialWelfareService = new SocialWelfareService()
