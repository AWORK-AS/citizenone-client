import BaseAPIService from '@/components/api/BaseAPIService'

class MassUnitService extends BaseAPIService {
    async getMassUnits(params: object): Promise<any> {
        return await this.request(`/user/mass-units`, 'GET', params)
    }

    async getMassUnit(massUnitUuid: any): Promise<any> {
        return await this.request(`/user/mass-units/${massUnitUuid}`, 'GET')
    }

    async saveMassUnit(params: object): Promise<any> {
        return await this.request(`/user/mass-units`, 'POST', params)
    }

    async updateMassUnit(massUnitUuid: any, params: object): Promise<any> {
        return await this.request(`/user/mass-units/${massUnitUuid}`, 'PUT', params)
    }

    async deleteMassUnit(massUnitUuid: any): Promise<any> {
        return await this.request(`/user/mass-units/${massUnitUuid}`, 'DELETE')
    }

    async getAllMassUnits(): Promise<any> {
        return await this.request(`/user/mass-units/all/list`, 'GET')
    }
}

export const massUnitService = new MassUnitService()