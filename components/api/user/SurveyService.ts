import BaseAPIService from '@/components/api/BaseAPIService'

class SurveyService extends BaseAPIService {
    async getSurveys(params: object): Promise<any> {
        return await this.request(`/user/surveys`, 'GET', params)
    }

    async getSurvey(surveyUuid: any): Promise<any> {
        return await this.request(`/user/surveys/${surveyUuid}`, 'GET')
    }

    async getAllSurveys(): Promise<any> {
        return await this.request(`/user/surveys/all/list`, 'GET')
    }

    async saveSurvey(params: object): Promise<any> {
        return await this.request(`/user/surveys`, 'POST', params)
    }

    async updateSurvey(surveyUuid: any, params: object): Promise<any> {
        return await this.request(`/user/surveys/${surveyUuid}`, 'PUT', params)
    }

    async deleteSurvey(surveyUuid: any): Promise<any> {
        return await this.request(`/user/surveys/${surveyUuid}`, 'DELETE')
    }

    async getAssignments(surveyUuid: any, params: object = {}): Promise<any> {
        return await this.request(`/user/surveys/${surveyUuid}/assignments`, 'GET', params)
    }

    async saveAssignment(surveyUuid: any, params: object): Promise<any> {
        return await this.request(`/user/surveys/${surveyUuid}/assignments`, 'POST', params)
    }

    async deleteAssignment(surveyUuid: any, assignmentUuid: any): Promise<any> {
        return await this.request(`/user/surveys/${surveyUuid}/assignments/${assignmentUuid}`, 'DELETE')
    }

    async getCitizenAssignments(citizenUuid: any): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/survey-assignments`, 'GET')
    }

    async completeAssignment(assignmentUuid: any, params: object): Promise<any> {
        return await this.request(`/user/survey-assignments/${assignmentUuid}/complete`, 'PUT', params)
    }
}

export const surveyService = new SurveyService()
