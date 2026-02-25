import BaseAPIService from '@/components/api/BaseAPIService'

class UserSubscriptionService extends BaseAPIService {
    async subscribe(params: object): Promise<any> {
        return await this.request(`/user/user-subscriptions`, 'POST', params)
    }

    async validateSubscription(paymentId: any): Promise<any> {
        return await this.request(`/user/user-subscriptions/${paymentId}/verify-payment`, 'POST')
    }

    async createStripePayment(params: {
        deal_uuid: string
        payment_type: 'monthly' | 'yearly' | 'one_time'
        citizen_id?: string | null
    }): Promise<{
        client_secret: string
        amount: number
    }> {
        return await this.request(`/stripe/payment-intent`, 'POST', params)
    }
}

export const userSubscriptionService = new UserSubscriptionService()