import BaseAPIService from '@/components/api/BaseAPIService'

class IncidentService extends BaseAPIService {
    async getIncidents(params: object): Promise<any> {
        return await this.request(`/user/citizen-incidents`, 'GET', params)
    }

    async getIncident(departmentUuid: any): Promise<any> {
        return await this.request(`/user/citizen-incidents/${departmentUuid}`, 'GET')
    }

    async saveIncident(params: object): Promise<any> {
        return await this.request(`/user/citizen-incidents`, 'POST', params)
    }

    async updateIncident(departmentUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-incidents/${departmentUuid}`, 'PUT', params)
    }

    async uploadIncidentFile(params: object): Promise<any> {
        return await this.request(`/user/incident-attachments`, 'POST', params)
    }
}

export const incidentService = new IncidentService()