import BaseAPIService from '@/components/api/user/BaseAPIService'

class NursingAreasService extends BaseAPIService {
    async getNursingProfessionalRecords(params: object): Promise<any> {
        return await this.request(`/user/nursing-areas`, 'GET', params)
    }

    async getNursingProfessionalRecord(nursingProfessionalRecordUuid: any): Promise<any> {
        return await this.request(`/user/nursing-areas/${nursingProfessionalRecordUuid}`, 'GET')
    }

    async saveNursingProfessionalRecord(params: object): Promise<any> {
        return await this.request(`/user/nursing-areas`, 'POST', params)
    }

    async updateNursingProfessionalRecord(nursingProfessionalRecordUuid: any, params: object): Promise<any> {
        return await this.request(`/user/nursing-areas/${nursingProfessionalRecordUuid}`, 'PUT', params)
    }

    async deleteNursingProfessionalRecord(nursingProfessionalRecordUuid: any): Promise<any> {
        return await this.request(`/user/nursing-areas/${nursingProfessionalRecordUuid}`, 'DELETE')
    }

    async uploadNursingFile(params: object): Promise<any> {
        return await this.request(`/user/nursing-attachments`, 'POST', params)
    }
}

export const nursingAreasService = new NursingAreasService()