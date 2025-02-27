import BaseAPIService from '@/components/api/user/BaseAPIService'

class DiagnosisService extends BaseAPIService {
    async getDiagnoses(params: object): Promise<any> {
        return await this.request(`/user/diagnoses`, 'GET', params)
    }

    async getDiagnosis(diagnosisUuid: any): Promise<any> {
        return await this.request(`/user/diagnoses/${diagnosisUuid}`, 'GET')
    }

    async saveDiagnosis(params: object): Promise<any> {
        return await this.request(`/user/diagnoses`, 'POST', params)
    }

    async updateDiagnosis(diagnosisUuid: any, params: object): Promise<any> {
        return await this.request(`/user/diagnoses/${diagnosisUuid}`, 'PUT', params)
    }

    async getAllDiagnoses(): Promise<any> {
        return await this.request(`/user/diagnoses/all/list`, 'GET')
    }
}

export const diagnosisService = new DiagnosisService()