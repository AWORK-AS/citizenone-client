import BaseAPIService from '@/components/api/BaseAPIService'

class DraftTemplateScheduleService extends BaseAPIService {
    async getDraftDutySchedules(params: object): Promise<any> {
        return await this.request(`/user/draft-template-schedules`, 'GET', params)
    }

    async getScheduleDraft(scheduleUuid: any): Promise<any> {
        return await this.request(`/user/draft-template-schedules/${scheduleUuid}`, 'GET')
    }

    async saveDraftDutySchedule(params: object): Promise<any> {
        return await this.request(`/user/draft-template-schedules`, 'POST', params)
    }

    async updateDraftDutySchedule(scheduleUuid: any, params: object): Promise<any> {
        return await this.request(`/user/draft-template-schedules/${scheduleUuid}`, 'PUT', params)
    }

    async deleteDraftDutySchedule(scheduleUuid: any): Promise<any> {
        return await this.request(`/user/draft-template-schedules/${scheduleUuid}`, 'DELETE')
    }

    async getDraftDutyScheduleAbsencePercentage(params: object): Promise<any> {
        return await this.request(`/user/draft-template-schedules/show/percentage`, 'GET', params)
    }

    async copyEmployeeWeeklyDraftDutySchedule(params: object): Promise<any> {
        return await this.request(`/user/draft-template-schedules/employee/weekly/copy`, 'POST', params)
    }

    async copyMultipleWeeklyDraftDutySchedule(params: object): Promise<any> {
        return await this.request(`/user/draft-template-schedules/weekly/copy`, 'POST', params)
    }

    async publishSchedule(params: object): Promise<any> {
        return await this.request(`/user/draft-template-schedules/publish/all`, 'POST', params)
    }
}

export const draftTemplateScheduleService = new DraftTemplateScheduleService()