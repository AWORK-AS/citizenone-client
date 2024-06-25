import BaseAPIService from '@/components/api/BaseAPIService'

class TimeLogService extends BaseAPIService {
    async getTimeLogs(params: object): Promise<any> {
        return await this.request(`/user/time-logs/current/user`, 'GET', params)
    }
}

export const timeLogService = new TimeLogService()