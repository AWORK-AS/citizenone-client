import BaseAPIService from '@/components/api/BaseAPIService'

class PatientBookingService extends BaseAPIService {
    async getServices(): Promise<any> {
        return await this.request(`/patient/booking/services`, 'GET')
    }

    async getService(uuid: string): Promise<any> {
        return await this.request(`/patient/booking/services/${uuid}`, 'GET')
    }

    async getTimeSlots(uuid: string, date: string): Promise<any> {
        return await this.request(`/patient/booking/services/${uuid}/time-slots/${date}`, 'GET')
    }

    async book(uuid: string, params: object): Promise<any> {
        return await this.request(`/patient/booking/services/${uuid}`, 'POST', params)
    }
}

export const patientBookingService = new PatientBookingService()
