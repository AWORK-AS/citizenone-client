import BaseAPIService from '@/components/api/BaseAPIService'

class NursingProfessionalRecordService extends BaseAPIService {
    async getNursingProfessionalRecords(params: object): Promise<any> {
        return await this.request(`/user/citizen-nursing-professional-records`, 'GET', params)
    }

    async getNursingProfessionalRecord(nursingProfessionalRecordUuid: any): Promise<any> {
        return await this.request(`/user/citizen-nursing-professional-records/${nursingProfessionalRecordUuid}`, 'GET')
    }

    async saveNursingProfessionalRecord(params: object): Promise<any> {
        return await this.request(`/user/citizen-nursing-professional-records`, 'POST', params)
    }

    async updateNursingProfessionalRecord(nursingProfessionalRecordUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-nursing-professional-records/${nursingProfessionalRecordUuid}`, 'PUT', params)
    }

    async deleteNursingProfessionalRecord(nursingProfessionalRecordUuid: any): Promise<any> {
        return await this.request(`/user/citizen-nursing-professional-records/${nursingProfessionalRecordUuid}`, 'DELETE')
    }
}

export const nursingProfessionalRecordService = new NursingProfessionalRecordService()