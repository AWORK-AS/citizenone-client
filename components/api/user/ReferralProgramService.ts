import BaseAPIService from '@/components/api/BaseAPIService'

// "Giv en måned, få en måned": the share link as a referral, and what it has earned. Answers 403
// for users who cannot commit the company to paying; the share modal then leaves the section out.
class ReferralProgramService extends BaseAPIService {
    async get(): Promise<any> {
        return await this.request(`/user/referral-program`, 'GET')
    }
}

export const referralProgramService = new ReferralProgramService()
