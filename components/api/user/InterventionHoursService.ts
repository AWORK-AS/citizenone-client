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

    async downloadInterventionHours(params: object): Promise<any> {
        return await this.request(`/user/citizen-care-hours/download/reports`, 'GET', params)
    }

    async getTimeAccount(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-care-hours/${citizenUuid}/summary-hours`, 'GET', params)
    }

    async timeIn(citizenUuid: any): Promise<any> {
        return await this.request(`/user/citizen-care-hours/${citizenUuid}/time-in`, 'POST')
    }

    async timeOut(citizenUuid: any): Promise<any> {
        return await this.request(`/user/citizen-care-hours/${citizenUuid}/time-out`, 'POST')
    }
}

export const interventionHoursService = new InterventionHoursService()