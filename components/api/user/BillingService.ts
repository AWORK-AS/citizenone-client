import BaseAPIService from '@/components/api/BaseAPIService'

/**
 * Payment standing for the signed-in company, and the self-service card
 * renewal that goes with it. Before this, a customer whose card had expired
 * could only be helped by hand: the one card-update link in the product was
 * minted by a nightly job and emailed out.
 */
class BillingService extends BaseAPIService {
    async getStatus(): Promise<any> {
        return await this.request(`/user/billing/status`, 'GET')
    }

    // Mints a fresh Nexi payment for the card-update widget. Admin only.
    async createPaymentMethod(): Promise<any> {
        return await this.request(`/user/billing/payment-method`, 'POST')
    }

    // Collects the outstanding amount against the card now on file.
    async retry(): Promise<any> {
        return await this.request(`/user/billing/retry`, 'POST')
    }
}

export const billingService = new BillingService()
