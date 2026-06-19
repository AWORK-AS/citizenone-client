import BaseAPIService from '@/components/api/BaseAPIService'

class TimelineService extends BaseAPIService {
    async getTimeline(citizenUuid: any): Promise<any> {
        return await this.request(`/user/timeline/citizens/${citizenUuid}`, 'GET')
    }

    async addEvent(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/timeline/citizens/${citizenUuid}`, 'POST', params)
    }

    async deleteEvent(eventUuid: any): Promise<any> {
        return await this.request(`/user/timeline/events/${eventUuid}`, 'DELETE')
    }

    async getEventTypes(): Promise<any> {
        return await this.request(`/user/timeline/event-types`, 'GET')
    }

    async createEventType(params: object): Promise<any> {
        return await this.request(`/user/timeline/event-types`, 'POST', params)
    }
}

export const timelineService = new TimelineService()
