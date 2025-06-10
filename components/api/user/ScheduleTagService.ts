import BaseAPIService from '@/components/api/BaseAPIService'

class ScheduleTagService extends BaseAPIService {
    async getScheduleTags(params: object): Promise<any> {
        return await this.request(`/user/schedule-tags`, 'GET', params)
    }

    async getScheduleTag(scheduleTagUuid: any): Promise<any> {
        return await this.request(`/user/schedule-tags/${scheduleTagUuid}`, 'GET')
    }

    async saveScheduleTag(params: object): Promise<any> {
        return await this.request(`/user/schedule-tags`, 'POST', params)
    }

    async updateScheduleTag(scheduleTagUuid: any, params: object): Promise<any> {
        return await this.request(`/user/schedule-tags/${scheduleTagUuid}`, 'PUT', params)
    }

    async deleteScheduleTag(scheduleTagUuid: any): Promise<any> {
        return await this.request(`/user/schedule-tags/${scheduleTagUuid}`, 'DELETE')
    }

    async getAllScheduleTags(): Promise<any> {
        return await this.request(`/user/schedule-tags/all/list`, 'GET')
    }
}

export const scheduleTagService = new ScheduleTagService()