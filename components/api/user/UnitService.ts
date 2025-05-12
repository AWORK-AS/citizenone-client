import BaseAPIService from '@/components/api/BaseAPIService'

class UnitService extends BaseAPIService {
    async getUnits(params: object): Promise<any> {
        return await this.request(`/user/units`, 'GET', params)
    }

    async getUnit(unitUuid: any): Promise<any> {
        return await this.request(`/user/units/${unitUuid}`, 'GET')
    }

    async saveUnit(params: object): Promise<any> {
        return await this.request(`/user/units`, 'POST', params)
    }

    async updateUnit(unitUuid: any, params: object): Promise<any> {
        return await this.request(`/user/units/${unitUuid}`, 'PUT', params)
    }

    async deleteUnit(unitUuid: any): Promise<any> {
        return await this.request(`/user/units/${unitUuid}`, 'DELETE')
    }

    async getAllUnits(): Promise<any> {
        return await this.request(`/user/units/all/list`, 'GET')
    }
}

export const unitService = new UnitService()