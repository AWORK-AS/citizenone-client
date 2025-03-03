import BaseAPIService from '@/components/api/user/BaseAPIService'

class ShiftService extends BaseAPIService {
    async getShifts(params: object): Promise<any> {
        return await this.request(`/user/shift-types`, 'GET', params)
    }

    async getShift(shiftUuid: any): Promise<any> {
        return await this.request(`/user/shift-types/${shiftUuid}`, 'GET')
    }

    async saveShift(params: object): Promise<any> {
        return await this.request(`/user/shift-types`, 'POST', params)
    }

    async updateShift(shiftUuid: any, params: object): Promise<any> {
        return await this.request(`/user/shift-types/${shiftUuid}`, 'PUT', params)
    }

    async deleteShift(shiftUuid: any): Promise<any> {
        return await this.request(`/user/shift-types/${shiftUuid}`, 'DELETE')
    }

    async getAllShifts(): Promise<any> {
        return await this.request(`/user/shift-types/all/list`, 'GET')
    }
}

export const shiftService = new ShiftService()