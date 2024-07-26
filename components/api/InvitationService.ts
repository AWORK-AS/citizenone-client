import BaseAPIService from '@/components/api/BaseAPIService'

class InvitationService extends BaseAPIService {
    async acceptCalendarInvitation(calendarUserUuid: any): Promise<any> {
        return await this.request(`/calendar-invite/${calendarUserUuid}/accept`, 'PUT')
    }
}

export const invitationService = new InvitationService()