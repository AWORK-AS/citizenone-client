import BaseAPIService from '@/components/api/BaseAPIService'

class DutyScheduleService extends BaseAPIService {
    async getDutySchedules(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules`, 'GET', params)
    }

    async saveDutySchedule(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules`, 'POST', params)
    }

    async updateDutySchedule(scheduleUuid: any, params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/${scheduleUuid}`, 'PUT', params)
    }

    async deleteDutySchedule(scheduleUuid: any, params?: object): Promise<any> {
        return await this.request(`/user/duty-schedules/${scheduleUuid}`, 'DELETE', params)
    }

    async downloadDutySchedules(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/download/report`, 'GET', params)
    }

    async getDutyScheduleAbsencePercentage(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/show/percentage`, 'GET', params)
    }

    async copyEmployeeWeeklyDutySchedule(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/employee/weekly/copy`, 'POST', params)
    }

    async copyMultipleWeeklyDutySchedule(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/weekly/copy`, 'POST', params)
    }

    async getDutySchedulesActivityLogs(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules-activity-logs`, 'GET', params)
    }

    async pinSelfToTopOfSchedule(): Promise<any> {
        return await this.request(`/user/duty-schedules/employee/pin`, 'POST')
    }

    async scheduleValidation(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/schedule/validation`, 'POST', params)
    }

    async getCompensatoryVacationHours(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/overview/compensatory-vacation-hours`, 'GET', params)
    }
}

export const dutyScheduleService = new DutyScheduleService()