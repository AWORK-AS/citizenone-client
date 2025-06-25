import BaseAPIService from '@/components/api/BaseAPIService'

class PatientCareHoursService extends BaseAPIService {
    async getPatientCareHours(params: any): Promise<any> {
        return await this.request(`/user/citizen-care-hours`, 'GET', params)
    }

    async savePatientCareHours(params: object): Promise<any> {
        return await this.request(`/user/citizen-care-hours`, 'POST', params)
    }

    async updatePatientCareHours(patientCareHoursUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-care-hours/${patientCareHoursUuid}`, 'PUT', params)
    }

    async deletePatientCareHours(patientCareHoursUuid: any): Promise<any> {
        return await this.request(`/user/citizen-care-hours/${patientCareHoursUuid}`, 'DELETE')
    }
}

export const patientCareHoursService = new PatientCareHoursService()