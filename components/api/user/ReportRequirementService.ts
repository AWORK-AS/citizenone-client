import BaseAPIService from '@/components/api/BaseAPIService'

class ReportRequirementService extends BaseAPIService {
    async getRequirementsByCitizen(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/report-requirements/citizen/${citizenUuid}`, 'GET', params)
    }

    async getRequirement(uuid: any): Promise<any> {
        return await this.request(`/user/report-requirements/${uuid}`, 'GET')
    }

    async saveRequirement(params: object): Promise<any> {
        return await this.request(`/user/report-requirements`, 'POST', params)
    }

    async updateRequirement(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/report-requirements/${uuid}`, 'PUT', params)
    }

    async toggleRequirementComplete(uuid: any): Promise<any> {
        return await this.request(`/user/report-requirements/${uuid}/complete`, 'POST')
    }

    async deleteRequirement(uuid: any): Promise<any> {
        return await this.request(`/user/report-requirements/${uuid}`, 'DELETE')
    }
}

export const reportRequirementService = new ReportRequirementService()
