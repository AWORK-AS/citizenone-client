import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenSurveyService extends BaseAPIService {
    async getSurveys(): Promise<any> {
        return await this.request(`/citizen/surveys`, 'GET')
    }

    async getSurvey(uuid: string): Promise<any> {
        return await this.request(`/citizen/surveys/${uuid}`, 'GET')
    }

    async submitSurvey(uuid: string, params: object): Promise<any> {
        return await this.request(`/citizen/surveys/${uuid}/submit`, 'PUT', params)
    }
}

export const citizenSurveyService = new CitizenSurveyService()
