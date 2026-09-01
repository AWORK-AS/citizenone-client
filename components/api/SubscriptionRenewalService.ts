import BaseAPIService from '@/components/api/BaseAPIService'

/**
 * Card renewal for a company that has already been suspended. Reached with the
 * one-time token from the suspension email rather than a session, because
 * being suspended is exactly what blocks the admin from logging in to fix it.
 */
class SubscriptionRenewalService extends BaseAPIService {
    async show(token: string): Promise<any> {
        return await this.request(`/subscription/renew/${token}`, 'GET')
    }

    async complete(token: string): Promise<any> {
        return await this.request(`/subscription/renew/${token}/complete`, 'POST')
    }
}

export const subscriptionRenewalService = new SubscriptionRenewalService()
