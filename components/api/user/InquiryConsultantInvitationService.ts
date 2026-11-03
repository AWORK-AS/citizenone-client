import BaseAPIService from '@/components/api/BaseAPIService'

class InquiryConsultantInvitationService extends BaseAPIService {
    async getForInquiry(inquiryUuid: string): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/consultant-invitations`, 'GET')
    }

    // notify false: picked without a message, the coordinator phones them first.
    async invite(inquiryUuid: string, userUuids: string[], notify = true): Promise<any> {
        return await this.request(
            `/user/citizen-inquiries/${inquiryUuid}/consultant-invitations`,
            'POST',
            notify ? { user_uuids: userUuids } : { user_uuids: userUuids, notify: false }
        )
    }

    async respond(invitationUuid: string, status: 'interested' | 'declined', note?: string): Promise<any> {
        return await this.request(
            `/user/inquiry-consultant-invitations/${invitationUuid}/respond`,
            'PUT',
            note ? { status, note } : { status }
        )
    }

    async select(invitationUuid: string): Promise<any> {
        return await this.request(`/user/inquiry-consultant-invitations/${invitationUuid}/select`, 'PUT')
    }

    // What the signed-in consultant has been asked about.
    async getMine(): Promise<any> {
        return await this.request(`/user/inquiry-consultant-invitations/mine`, 'GET')
    }
}

export const inquiryConsultantInvitationService = new InquiryConsultantInvitationService()
