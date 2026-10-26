import BaseAPIService from '@/components/api/BaseAPIService'

/**
 * Paying the failed invoice of a company that has already been suspended.
 * Reached with the one-time token from the suspension email rather than a
 * session, because being suspended is exactly what blocks the admin from
 * logging in to pay it.
 */
class SubscriptionRenewalService extends BaseAPIService {
    async show(token: string): Promise<any> {
        return await this.request(`/subscription/renew/${token}`, 'GET')
    }

    /** Opens the Nexi checkout that pays the failed invoice with a new card. */
    async pay(token: string): Promise<any> {
        return await this.request(`/subscription/renew/${token}/pay`, 'POST')
    }

    async complete(token: string, paymentId: string): Promise<any> {
        return await this.request(`/subscription/renew/${token}/complete`, 'POST', { payment_id: paymentId })
    }
}

export const subscriptionRenewalService = new SubscriptionRenewalService()
