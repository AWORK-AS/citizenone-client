import BaseAPIService from '@/components/api/BaseAPIService'

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

    // Roadmap #396: xlsx/csv of one citizen (citizen_uuid) or every citizen the user can see.
    async exportRecords(params: object, onHeaders?: (headers: Headers) => void): Promise<Blob | null> {
        return await this.requestBlob(`/user/citizen-incidents/export`, 'GET', params, onHeaders)
    }
}

export const incidentService = new IncidentService()