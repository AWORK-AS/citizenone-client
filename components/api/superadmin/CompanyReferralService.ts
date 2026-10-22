import BaseAPIService from '@/components/api/BaseAPIService'

class CompanyReferralService extends BaseAPIService {
    async getOverview(params: object): Promise<any> {
        return await this.request(`/superadmin/company-referrals`, 'GET', params)
    }

    async settleCredit(uuid: string, params: { status: 'applied' | 'void', note: string }): Promise<any> {
        return await this.request(`/superadmin/referral-credits/${uuid}`, 'PATCH', params)
    }
}

export const superadminCompanyReferralService = new CompanyReferralService()
