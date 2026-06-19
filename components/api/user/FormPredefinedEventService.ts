import BaseAPIService from '@/components/api/BaseAPIService'

class FormPredefinedEventService extends BaseAPIService {
    async getPredefinedEvents(formUuid: any, params: object = {}): Promise<any> {
        return await this.request(`/user/forms/${formUuid}/predefined-events`, 'GET', params)
    }

    async createPredefinedEvent(formUuid: any, params: object): Promise<any> {
        return await this.request(`/user/forms/${formUuid}/predefined-events`, 'POST', params)
    }

    async getPredefinedEvent(formUuid: any, uuid: any): Promise<any> {
        return await this.request(`/user/forms/${formUuid}/predefined-events/${uuid}`, 'GET')
    }

    async updatePredefinedEvent(formUuid: any, uuid: any, params: object): Promise<any> {
        return await this.request(`/user/forms/${formUuid}/predefined-events/${uuid}`, 'PUT', params)
    }

    async deletePredefinedEvent(formUuid: any, uuid: any): Promise<any> {
        return await this.request(`/user/forms/${formUuid}/predefined-events/${uuid}`, 'DELETE')
    }
}

export const formPredefinedEventService = new FormPredefinedEventService()
