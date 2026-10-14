import BaseAPIService from '@/components/api/BaseAPIService'

class PatientVideoConsultationService extends BaseAPIService {
    // {uuid} is the calendar event of the appointment (`video_consultation_uuid`).
    async join(uuid: string): Promise<any> {
        return await this.request(`/patient/video-consultations/${uuid}/join`, 'POST')
    }
}

export const patientVideoConsultationService = new PatientVideoConsultationService()
