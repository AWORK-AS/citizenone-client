import BaseAPIService from '@/components/api/user/BaseAPIService'

class IncidentService extends BaseAPIService {
    async getIncidents(params: object): Promise<any> {
        return await this.request(`/user/citizen-incidents`, 'GET', params)
    }

    async getIncident(incidentUuid: any): Promise<any> {
        return await this.request(`/user/citizen-incidents/${incidentUuid}`, 'GET')
    }

    async saveIncident(params: object): Promise<any> {
        return await this.request(`/user/citizen-incidents`, 'POST', params)
    }

    async updateIncident(incidentUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-incidents/${incidentUuid}`, 'PUT', params)
    }

    async uploadIncidentFile(params: object): Promise<any> {
        return await this.request(`/user/incident-attachments`, 'POST', params)
    }
}

export const incidentService = new IncidentService()