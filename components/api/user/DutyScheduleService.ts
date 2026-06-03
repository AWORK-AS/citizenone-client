import BaseAPIService from '@/components/api/BaseAPIService'

class DutyScheduleService extends BaseAPIService {
    async getDutySchedules(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules`, 'GET', params)
    }

    async getDutySchedulesMonthView(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/monthly/view`, 'GET', params)
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

    async moveShift(scheduleUuid: any, params?: object): Promise<any> {
        return await this.request(`/user/duty-schedules/${scheduleUuid}/move-shift`, 'POST', params)
    }

    async downloadDutySchedules(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/download/report`, 'GET', params)
    }

    async getDutyScheduleAbsencePercentage(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/show/percentage`, 'GET', params)
    }

    async getShiftTypesDistribution(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/employee/shift-distribution`, 'GET', params)
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

    async getEmployeeHoursStats(employeeUuid: string, params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/employee/${employeeUuid}/hours-stats`, 'GET', params)
    }

    async getCompensatoryReport(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/compensatory-time/${uuid}/report`, 'GET', params)
    }

    async getSharedDutySchedules(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/share/schedules`, 'GET', params)
    }

    async shareDutySchedules(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules/share/schedules`, 'POST', params)
    }

    async deleteSharedDutySchedules(sharedSchedulesUuid: any): Promise<any> {
        return await this.request(`/user/duty-schedules/share/schedules/${sharedSchedulesUuid}`, 'DELETE')
    }
}

export const dutyScheduleService = new DutyScheduleService()