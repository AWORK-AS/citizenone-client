import BaseAPIService from '@/components/api/BaseAPIService'
import { normalizeCompanyBilling, type CompanyBilling } from '@/composables/billingMethod'

/**
 * Payment standing for the signed-in company, and the self-service card
 * renewal that goes with it. Before this, a customer whose card had expired
 * could only be helped by hand: the one card-update link in the product was
 * minted by a nightly job and emailed out.
 */
export type CardSecurityInfo = {
    status: 'active' | 'missing'
    last_four: string | null
    expiry: string | null
    consent_version: string
    consent_text: string
}

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
     * How the company pays, from the same standing the wall reads: `billing_method`
     * is "card", "invoice", or null for a running customer agreement (Elite), which
     * shows Elite and no payment method. The masked security card is the `card_security`
     * block, present only for invoice customers while the feature is on.
     */
    async getPaymentMethod(): Promise<CompanyBilling> {
        const response = await this.getStatus()
        return normalizeCompanyBilling(response?.data ?? response)
    }

    /**
     * The card an invoice customer has put up as security, with the consent text to show.
     * Admin only. Answers 404 while the feature is off, which comes back as `null` so the
     * caller hides the whole flow.
     */
    async getCardSecurity(): Promise<CardSecurityInfo | null> {
        try {
            const response = await this.request(`/user/billing/card-security`, 'GET')
            const data = response?.data ?? {}

            return {
                status: data.status === 'active' ? 'active' : 'missing',
                last_four: data.last_four ?? null,
                expiry: data.expiry ?? null,
                consent_version: String(data.consent_version ?? ''),
                consent_text: String(data.consent_text ?? ''),
            }
        } catch (error: any) {
            if (error?.status === 404) return null
            throw error
        }
    }

    /** 0 kr., cards only. The consent version must be the one from `getCardSecurity`. */
    async startCardSecurityCheckout(consentVersion: string): Promise<any> {
        return await this.request(`/user/billing/card-security/checkout`, 'POST', { consent: true, consent_version: consentVersion })
    }

    // Confirms the Nexi payment from the widget. The webhook activates the card too.
    async completeCardSecurity(paymentId: string): Promise<any> {
        return await this.request(`/user/billing/card-security/complete`, 'POST', { payment_id: paymentId })
    }

    /**
     * Mints the one-time renewal link. Admin only. Every call replaces the previous link, so
     * it is only ever called from a click, never on page load.
     */
    async createRenewalLink(): Promise<any> {
        return await this.request(`/user/billing/renewal-link`, 'POST')
    }

    // Withdraws the customer's security card. Admin only; 404 while the feature is off.
    async removeCardSecurity(): Promise<any> {
        return await this.request(`/user/billing/card-security`, 'DELETE')
    }

    // Collects the outstanding amount against the card now on file.
    async retry(): Promise<any> {
        return await this.request(`/user/billing/retry`, 'POST')
    }
}

export const billingService = new BillingService()
