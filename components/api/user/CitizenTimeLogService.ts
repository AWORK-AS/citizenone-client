import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenTimeLogService extends BaseAPIService {

    async getWalletsPerCitizen(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/citizen-time-logs`, 'GET', params)
    }

    async downloadTimeLog(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/download/citizen-time-logs`, 'GET', params)
    }

    async timeLogSummary(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/time-logs/${citizenUuid}/summary-hours`, 'GET', params)
    }
}

export const citizenTimeLogService = new CitizenTimeLogService()