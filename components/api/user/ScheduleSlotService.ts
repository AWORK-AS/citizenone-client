import BaseAPIService from '@/components/api/BaseAPIService'

class ScheduleSlotService extends BaseAPIService {
    async getScheduleSlots(params: object): Promise<any> {
        return await this.request(`/user/schedule-slots`, 'GET', params)
    }

    async getScheduleSlot(scheduleSlotUuid: any): Promise<any> {
        return await this.request(`/user/schedule-slots/${scheduleSlotUuid}`, 'GET')
    }

    async saveScheduleSlot(params: object): Promise<any> {
        return await this.request(`/user/schedule-slots`, 'POST', params)
    }

    async updateScheduleSlot(scheduleSlotUuid: any, params: object): Promise<any> {
        return await this.request(`/user/schedule-slots/${scheduleSlotUuid}`, 'PUT', params)
    }

    async deleteScheduleSlot(scheduleSlotUuid: any): Promise<any> {
        return await this.request(`/user/schedule-slots/${scheduleSlotUuid}`, 'DELETE')
    }

    async getScheduleSlotsRequesters(scheduleSlotUuid: any, params: object): Promise<any> {
        return await this.request(`/user/schedule-slots/${scheduleSlotUuid}/schedule-grabbers`, 'GET', params)
    }
}

export const scheduleSlotService = new ScheduleSlotService()