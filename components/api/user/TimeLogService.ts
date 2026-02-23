import BaseAPIService from '@/components/api/BaseAPIService'

class TimeLogService extends BaseAPIService {
    async getCurrentUserTimeLogs(params: object): Promise<any> {
        return await this.request(`/user/time-logs/current/user`, 'GET', params)
    }

    async getEmployeeTimeLogs(employeeUuid: any, params: object): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}/time-logs`, 'GET', params)
    }

    async getTimeLog(timeLogUuid: any): Promise<any> {
        return await this.request(`/user/time-logs/${timeLogUuid}`, 'GET')
    }

    async saveTimeLog(params: object): Promise<any> {
        return await this.request(`/user/time-logs`, 'POST', params)
    }

    async updateTimeLog(timeLogUuid: any, params: object): Promise<any> {
        return await this.request(`/user/time-logs/${timeLogUuid}`, 'PUT', params)
    }

    async deleteTimeLog(timeLogUuid: any): Promise<any> {
        return await this.request(`/user/time-logs/${timeLogUuid}`, 'DELETE')
    }

    async downloadTimeLog(params: object): Promise<any> {
        return await this.request(`/user/time-logs/download/report`, 'GET', params)
    }
}

export const timeLogService = new TimeLogService()