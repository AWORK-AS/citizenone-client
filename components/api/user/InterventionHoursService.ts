import BaseAPIService from '@/components/api/BaseAPIService'

class InterventionHoursService extends BaseAPIService {
    async getInterventionHours(params: any): Promise<any> {
        return await this.request(`/user/citizen-care-hours`, 'GET', params)
    }

    async saveInterventionHours(params: object): Promise<any> {
        return await this.request(`/user/citizen-care-hours`, 'POST', params)
    }

    async updateInterventionHours(interventionHoursUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-care-hours/${interventionHoursUuid}`, 'PUT', params)
    }

    async deleteInterventionHours(interventionHoursUuid: any): Promise<any> {
        return await this.request(`/user/citizen-care-hours/${interventionHoursUuid}`, 'DELETE')
    }
}

export const interventionHoursService = new InterventionHoursService()