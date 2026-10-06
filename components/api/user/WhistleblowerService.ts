import BaseAPIService from '@/components/api/BaseAPIService'

/** The handlers' whistleblower inbox and the admins' settings (both signed in). */
class WhistleblowerService extends BaseAPIService {
    async getReports(params: object): Promise<any> {
        return await this.request(`/user/whistleblower/reports`, 'GET', params)
    }

    async getReport(uuid: string): Promise<any> {
        return await this.request(`/user/whistleblower/reports/${uuid}`, 'GET')
    }

    async changeStatus(uuid: string, status: string): Promise<any> {
        return await this.request(`/user/whistleblower/reports/${uuid}/status`, 'PUT', { status })
    }

    async addNote(uuid: string, body: string): Promise<any> {
        return await this.request(`/user/whistleblower/reports/${uuid}/notes`, 'POST', { body })
    }

    async getSettings(): Promise<any> {
        return await this.request(`/user/whistleblower/settings`, 'GET')
    }

    async saveSettings(params: object): Promise<any> {
        return await this.request(`/user/whistleblower/settings`, 'PUT', params)
    }

    async regenerateLink(): Promise<any> {
        return await this.request(`/user/whistleblower/settings/regenerate-link`, 'POST')
    }
}

export const whistleblowerService = new WhistleblowerService()
