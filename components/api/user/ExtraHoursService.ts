import BaseAPIService from '@/components/api/BaseAPIService'

class ExtraHoursService extends BaseAPIService {
    async getExtraHours(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules-extra-hours`, 'GET', params)
    }

    async getExtraHour(extraHoursUuid: any): Promise<any> {
        return await this.request(`/user/duty-schedules-extra-hours/${extraHoursUuid}`, 'GET')
    }

    async saveExtraHour(params: object): Promise<any> {
        return await this.request(`/user/duty-schedules-extra-hours`, 'POST', params)
    }

    async updateExtraHour(extraHoursUuid: any, params: object): Promise<any> {
        return await this.request(`/user/duty-schedules-extra-hours/${extraHoursUuid}`, 'PUT', params)
    }

    async deleteExtraHour(extraHoursUuid: any): Promise<any> {
        return await this.request(`/user/duty-schedules-extra-hours/${extraHoursUuid}`, 'DELETE')
    }

    async approveExtraHour(extraHoursUuid: any): Promise<any> {
        return await this.request(`/user/duty-schedules-extra-hours/${extraHoursUuid}/approve`, 'POST')
    }

    async rejectExtraHour(extraHoursUuid: any): Promise<any> {
        return await this.request(`/user/duty-schedules-extra-hours/${extraHoursUuid}/reject`, 'POST')
    }
}

export const extraHoursService = new ExtraHoursService()