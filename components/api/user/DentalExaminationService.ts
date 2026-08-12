import BaseAPIService from '@/components/api/BaseAPIService'

class DentalExaminationService extends BaseAPIService {
    async getExaminations(citizenUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/dental-examinations`, 'GET')
    }

    async createExamination(citizenUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/dental-examinations`, 'POST', params)
    }

    async deleteExamination(uuid: string): Promise<any> {
        return await this.request(`/user/dental-examinations/${uuid}`, 'DELETE')
    }
}

export const dentalExaminationService = new DentalExaminationService()
