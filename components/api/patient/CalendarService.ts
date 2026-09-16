import BaseAPIService from '@/components/api/BaseAPIService'

class PatientCalendarService extends BaseAPIService {
    async getEvents(params: object): Promise<any> {
        return await this.request(`/patient/calendar/events`, 'GET', params)
    }
}

export const patientCalendarService = new PatientCalendarService()
