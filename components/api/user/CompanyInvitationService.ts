import BaseAPIService from '@/components/api/BaseAPIService'

class CompanyInvitationService extends BaseAPIService {
    async acceptInvitation(params: object): Promise<any> {
        return await this.request(`/user/accept/company-invite`, 'POST', params)
    }
}

export const companyInvitationService = new CompanyInvitationService()