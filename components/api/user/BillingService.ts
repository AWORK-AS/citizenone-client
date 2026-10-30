import BaseAPIService from '@/components/api/BaseAPIService'
import { normalizeCompanyBilling, type CompanyBilling } from '@/composables/billingMethod'

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

    // Every recurring card charge, its lines and next date. Admin or manage_licenses.
    async getOverview(): Promise<any> {
        return await this.request(`/user/billing/overview`, 'GET')
    }

    /**
     * How the company pays and, for invoice customers, the masked security card.
     * Never a full card number: the API returns only the masked number and expiry.
     */
    async getPaymentMethod(): Promise<CompanyBilling> {
        const response = await this.request(`/user/billing/method`, 'GET')
        return normalizeCompanyBilling(response)
    }

    /**
     * Starts attaching a card as security (no charge). The customer's consent is
     * sent with the request so the API can log it with a timestamp. Admin only.
     */
    async startSecurityCard(consent: boolean): Promise<any> {
        return await this.request(`/user/billing/security-card`, 'POST', { consent })
    }

    // Confirms the Nexi payment from the widget and stores the masked card.
    async completeSecurityCard(paymentId: string): Promise<any> {
        return await this.request(`/user/billing/security-card/complete`, 'POST', { payment_id: paymentId })
    }

    // Collects the outstanding amount against the card now on file.
    async retry(): Promise<any> {
        return await this.request(`/user/billing/retry`, 'POST')
    }
}

export const billingService = new BillingService()
