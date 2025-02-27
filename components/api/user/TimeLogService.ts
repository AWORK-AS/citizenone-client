import BaseAPIService from '@/components/api/user/BaseAPIService'

class TimeLogService extends BaseAPIService {
    async getTimeLogs(params: object): Promise<any> {
        return await this.request(`/user/time-logs/current/user`, 'GET', params)
    }
}

export const timeLogService = new TimeLogService()