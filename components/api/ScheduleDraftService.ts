import BaseAPIService from '@/components/api/BaseAPIService'

class ScheduleDraftService extends BaseAPIService {
    async getScheduleDrafts(params: object): Promise<any> {
        return await this.request(`/user/draft-schedules`, 'GET', params)
    }

    async getScheduleDraft(scheduleUuid: any): Promise<any> {
        return await this.request(`/user/draft-schedules/${scheduleUuid}`, 'GET')
    }

    async saveScheduleDraft(params: object): Promise<any> {
        return await this.request(`/user/draft-schedules`, 'POST', params)
    }

    async updateScheduleDraft(scheduleUuid: any, params: object): Promise<any> {
        return await this.request(`/user/draft-schedules/${scheduleUuid}`, 'PUT', params)
    }

    async delteScheduleDraft(scheduleUuid: any): Promise<any> {
        return await this.request(`/user/draft-schedules/${scheduleUuid}`, 'DELETE')
    }

    async getDraftDutyScheduleAbsencePercentage(params: object): Promise<any> {
        return await this.request(`/user/draft-schedules/show/percentage`, 'GET', params)
    }

    async getAllScheduleDraft(): Promise<any> {
        return await this.request(`/user/draft-schedules/all/list`, 'GET')
    }
}

export const scheduleDraftService = new ScheduleDraftService()