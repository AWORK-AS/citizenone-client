import BaseAPIService from '@/components/api/BaseAPIService'

class PatientSurveyService extends BaseAPIService {
    async getSurveys(): Promise<any> {
        return await this.request(`/patient/surveys`, 'GET')
    }

    async getSurvey(uuid: string): Promise<any> {
        return await this.request(`/patient/surveys/${uuid}`, 'GET')
    }

    async submitSurvey(uuid: string, params: object): Promise<any> {
        return await this.request(`/patient/surveys/${uuid}/submit`, 'PUT', params)
    }
}

export const patientSurveyService = new PatientSurveyService()
