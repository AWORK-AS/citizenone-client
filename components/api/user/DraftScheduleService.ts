import BaseAPIService from '@/components/api/user/BaseAPIService'

class DraftScheduleService extends BaseAPIService {
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

    async deleteScheduleDraft(scheduleUuid: any): Promise<any> {
        return await this.request(`/user/draft-schedules/${scheduleUuid}`, 'DELETE')
    }

    async getDraftDutyScheduleAbsencePercentage(params: object): Promise<any> {
        return await this.request(`/user/draft-schedules/show/percentage`, 'GET', params)
    }

    async copyWeeklyDraftDutySchedule(params: object): Promise<any> {
        return await this.request(`/user/draft-schedules/weekly/copy`, 'POST', params)
    }

    async publishSchedule(): Promise<any> {
        return await this.request(`/user/draft-schedules/publish/all`, 'POST')
    }
}

export const draftScheduleService = new DraftScheduleService()