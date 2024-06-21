import BaseAPIService from '@/components/api/BaseAPIService'

class UserSubscriptionService extends BaseAPIService {
    async subscribe(params: object): Promise<any> {
        return await this.request(`/user/user-subscriptions`, 'POST', params)
    }
}

export const userSubscriptionService = new UserSubscriptionService()