import BaseAPIService from '@/components/api/BaseAPIService'

class DraftScheduleService extends BaseAPIService {
    async getDraftDutySchedules(params: object): Promise<any> {
        return await this.request(`/user/draft-schedules`, 'GET', params)
    }

    async getScheduleDraft(scheduleUuid: any): Promise<any> {
        return await this.request(`/user/draft-schedules/${scheduleUuid}`, 'GET')
    }

    async saveDraftDutySchedule(params: object): Promise<any> {
        return await this.request(`/user/draft-schedules`, 'POST', params)
    }

    async updateDraftDutySchedule(scheduleUuid: any, params: object): Promise<any> {
        return await this.request(`/user/draft-schedules/${scheduleUuid}`, 'PUT', params)
    }

    async deleteDraftDutySchedule(scheduleUuid: any): Promise<any> {
        return await this.request(`/user/draft-schedules/${scheduleUuid}`, 'DELETE')
    }

    async getDraftDutyScheduleAbsencePercentage(params: object): Promise<any> {
        return await this.request(`/user/draft-schedules/show/percentage`, 'GET', params)
    }

    async copyEmployeeWeeklyDraftDutySchedule(params: object): Promise<any> {
        return await this.request(`/user/draft-schedules/employee/weekly/copy`, 'POST', params)
    }

    async copyMultipleWeeklyDraftDutySchedule(params: object): Promise<any> {
        return await this.request(`/user/draft-schedules/weekly/copy`, 'POST', params)
    }

    async publishSchedule(params: object): Promise<any> {
        return await this.request(`/user/draft-schedules/publish/all`, 'POST', params)
    }

    async pinSelfToTopOfSchedule(): Promise<any> {
        return await this.request(`/user/draft-schedules/employee/pin`, 'POST')
    }
}

export const draftScheduleService = new DraftScheduleService()