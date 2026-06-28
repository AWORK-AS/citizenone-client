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
}

export const powerBiService = new PowerBiService()
