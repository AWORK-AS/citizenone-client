import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenCareHourLocationLogService extends BaseAPIService {
    async logLocation(params: object): Promise<any> {
        return await this.request(`/user/citizen-care-hour-location-logs`, 'POST', params)
    }

    async getLocationLogs(careHourUuid: any): Promise<any> {
        return await this.request(`/user/citizen-care-hour-location-logs/${careHourUuid}`, 'GET')
    }

    /**
     * Flushes a backlog of buffered breadcrumbs in one request — used when the
     * page was backgrounded/frozen and the live 30s-interval logLocation()
     * calls above couldn't fire. See backend/dev.md for the endpoint contract.
     */
    async logLocationBatch(params: { citizen_care_hour_uuid: string; points: Array<{ latitude: number; longitude: number; recorded_at?: string }> }): Promise<any> {
        return await this.request(`/user/citizen-care-hour-location-logs/batch`, 'POST', params)
    }
}

export const citizenCareHourLocationLogService = new CitizenCareHourLocationLogService()