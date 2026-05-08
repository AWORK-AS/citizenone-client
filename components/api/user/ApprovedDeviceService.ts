import BaseAPIService from '@/components/api/BaseAPIService'

class ApprovedDeviceService extends BaseAPIService {
    async getAll(params: object): Promise<any> {
        return await this.request(`/user/approved-devices`, 'GET', params)
    }

    async create(params: object): Promise<any> {
        return await this.request(`/user/approved-devices`, 'POST', params)
    }

    async update(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/approved-devices/${uuid}`, 'PUT', params)
    }

    async delete(uuid: string): Promise<any> {
        return await this.request(`/user/approved-devices/${uuid}`, 'DELETE')
    }
}

export const approvedDeviceService = new ApprovedDeviceService()
