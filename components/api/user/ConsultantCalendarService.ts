import BaseAPIService from '@/components/api/BaseAPIService'

class ConsultantCalendarService extends BaseAPIService {
    // One or more consultants' appointments in a period, across their citizens,
    // with the planned hours per consultant.
    async getOverview(params: object): Promise<any> {
        return await this.request(`/user/consultant-calendar`, 'GET', params)
    }

    // An appointment for one consultant: on a citizen, or a staff meeting or
    // supervision. A colleague needs Manager or "book consultants".
    async book(params: object): Promise<any> {
        return await this.request(`/user/consultant-calendar/book`, 'POST', params)
    }
}

export const consultantCalendarService = new ConsultantCalendarService()
