import BaseAPIService from '@/components/api/BaseAPIService'

/** The patient's prescriptions and the renewals they asked for. */
class PatientPrescriptionService extends BaseAPIService {
    async getPrescriptions(): Promise<any> {
        return await this.request(`/patient/prescriptions`, 'GET')
    }

    async getRenewals(): Promise<any> {
        return await this.request(`/patient/prescription-renewals`, 'GET')
    }

    async requestRenewal(params: { citizen_medicine_uuid: string, note?: string }): Promise<any> {
        return await this.request(`/patient/prescription-renewals`, 'POST', params)
    }

    /** "Request a new prescription": sends the questionnaire the clinic picked for it. */
    async requestNewPrescription(params: { note?: string }): Promise<any> {
        return await this.request(`/patient/prescription-renewals/new`, 'POST', params)
    }
}

export const patientPrescriptionService = new PatientPrescriptionService()
