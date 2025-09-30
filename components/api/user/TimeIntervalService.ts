import BaseAPIService from '@/components/api/BaseAPIService'

class TimeIntervalService extends BaseAPIService {
    async getAllTimeIntervals(): Promise<any> {
        return await this.request(`/user/time-intervals/all/list`, 'GET')
    }
}

export const timeIntervalService = new TimeIntervalService()