import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenTimeLogService extends BaseAPIService {

    async getWalletsPerCitizen(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/citizen-time-logs`, 'GET', params)
    }
}

export const citizenTimeLogService = new CitizenTimeLogService()