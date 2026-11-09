import BaseAPIService from '@/components/api/BaseAPIService'

class PowerBiService extends BaseAPIService {
    async getStatus(): Promise<any> {
        return await this.request(`/user/power-bi`, 'GET')
    }

    async generateToken(): Promise<any> {
        return await this.request(`/user/power-bi/token`, 'POST')
    }

    async revokeToken(): Promise<any> {
        return await this.request(`/user/power-bi/token`, 'DELETE')
    }

    async updateSettings(payload: { without_names: boolean }): Promise<any> {
        return await this.request(`/user/power-bi/settings`, 'PUT', payload)
    }

    async preview(): Promise<any> {
        return await this.request(`/user/power-bi/preview`, 'GET')
    }

    async check(): Promise<any> {
        return await this.request(`/user/power-bi/check`, 'GET')
    }
}

export const powerBiService = new PowerBiService()
