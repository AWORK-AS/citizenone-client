import BaseAPIService from '@/components/api/BaseAPIService'

class VideoConsultationService extends BaseAPIService {
    // {uuid} is the calendar event the consultation belongs to.
    async join(uuid: string): Promise<any> {
        return await this.request(`/user/video-consultations/${uuid}/join`, 'POST')
    }

    async end(uuid: string): Promise<any> {
        return await this.request(`/user/video-consultations/${uuid}/end`, 'POST')
    }
}

export const videoConsultationService = new VideoConsultationService()
