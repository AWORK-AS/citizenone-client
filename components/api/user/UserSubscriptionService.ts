import BaseAPIService from '@/components/api/user/BaseAPIService'

class UserSubscriptionService extends BaseAPIService {
    async subscribe(params: object): Promise<any> {
        return await this.request(`/user/user-subscriptions`, 'POST', params)
    }

    async validateSubscription(paymentId: any): Promise<any> {
        return await this.request(`/user/user-subscriptions/${paymentId}/verify-payment`, 'POST')
    }
}

export const userSubscriptionService = new UserSubscriptionService()