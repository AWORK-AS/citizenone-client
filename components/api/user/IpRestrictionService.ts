import BaseAPIService from '@/components/api/BaseAPIService'

class IpRestrictionService extends BaseAPIService {
    async getAll(params: object): Promise<any> {
        return await this.request(`/user/ip-restrictions`, 'GET', params)
    }

    async create(params: object): Promise<any> {
        return await this.request(`/user/ip-restrictions`, 'POST', params)
    }

    async update(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/ip-restrictions/${uuid}`, 'PUT', params)
    }

    async delete(uuid: string): Promise<any> {
        return await this.request(`/user/ip-restrictions/${uuid}`, 'DELETE')
    }
}

export const ipRestrictionService = new IpRestrictionService()
