import BaseAPIService from '@/components/api/BaseAPIService'

class VitalService extends BaseAPIService {
    async getVitals(params: object): Promise<any> {
        return await this.request(`/user/vitals`, 'GET', params)
    }

    async getVital(vitalUuid: any): Promise<any> {
        return await this.request(`/user/vitals/${vitalUuid}`, 'GET')
    }

    async saveVital(params: object): Promise<any> {
        return await this.request(`/user/vitals`, 'POST', params)
    }

    async updateVital(vitalUuid: any, params: object): Promise<any> {
        return await this.request(`/user/vitals/${vitalUuid}`, 'PUT', params)
    }

    async deleteVital(vitalUuid: any): Promise<any> {
        return await this.request(`/user/vitals/${vitalUuid}`, 'DELETE')
    }
}

export const vitalService = new VitalService()