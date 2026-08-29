import BaseAPIService from '@/components/api/BaseAPIService'

class PatientAppointmentService extends BaseAPIService {
    async getAppointments(params: object): Promise<any> {
        return await this.request(`/patient/appointments`, 'GET', params)
    }

    async getAppointment(uuid: string): Promise<any> {
        return await this.request(`/patient/appointments/${uuid}`, 'GET')
    }
}

export const patientAppointmentService = new PatientAppointmentService()
