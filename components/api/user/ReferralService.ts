import BaseAPIService from '@/components/api/BaseAPIService'

class ReferralService extends BaseAPIService {
    async getReferrals(params: object): Promise<any> {
        return await this.request(`/user/referrals`, 'GET', params)
    }

    async getReferral(referralUuid: any): Promise<any> {
        return await this.request(`/user/referrals/${referralUuid}`, 'GET')
    }

    async saveReferral(params: object): Promise<any> {
        return await this.request(`/user/referrals`, 'POST', params)
    }

    async updateReferral(referralUuid: any, params: object): Promise<any> {
        return await this.request(`/user/referrals/${referralUuid}`, 'PUT', params)
    }

    async deleteReferral(referralUuid: any): Promise<any> {
        return await this.request(`/user/referrals/${referralUuid}`, 'DELETE')
    }
}

export const referralService = new ReferralService()
