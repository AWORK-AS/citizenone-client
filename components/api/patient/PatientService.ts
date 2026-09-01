import BaseAPIService from '@/components/api/BaseAPIService'

class PatientService extends BaseAPIService {
    async getCurrentLoggedInPatient(): Promise<any> {
        return await this.request(`/patient`, 'GET')
    }

    async updatePatientLanguage(params: object): Promise<any> {
        return await this.request(`/patient/update/language`, 'PUT', params)
    }

    async getOverview(): Promise<any> {
        return await this.request(`/patient/overview`, 'GET')
    }

    async getNotifications(params: object = {}): Promise<any> {
        return await this.request(`/patient/notifications`, 'GET', params)
    }

    async markNotificationRead(id: string): Promise<any> {
        return await this.request(`/patient/notifications/${id}/read`, 'PUT')
    }
}

export const patientService = new PatientService()
