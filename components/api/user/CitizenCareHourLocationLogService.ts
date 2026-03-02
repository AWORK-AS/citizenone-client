import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenCareHourLocationLogService extends BaseAPIService {
    async logLocation(params: object): Promise<any> {
        return await this.request(`/user/citizen-care-hour-location-logs`, 'POST', params)
    }

    async getLocationLogs(careHourUuid: any): Promise<any> {
        return await this.request(`/user/citizen-care-hour-location-logs/${careHourUuid}`, 'GET')
    }
}

export const citizenCareHourLocationLogService = new CitizenCareHourLocationLogService()