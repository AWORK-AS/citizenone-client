import BaseAPIService from '@/components/api/BaseAPIService'

class AddictionService extends BaseAPIService {
    async getAddictions(params: object): Promise<any> {
        return await this.request(`/user/addictions`, 'GET', params)
    }

    async getAddiction(addictionUuid: any): Promise<any> {
        return await this.request(`/user/addictions/${addictionUuid}`, 'GET')
    }

    async saveAddiction(params: object): Promise<any> {
        return await this.request(`/user/addictions`, 'POST', params)
    }

    async updateAddiction(addictionUuid: any, params: object): Promise<any> {
        return await this.request(`/user/addictions/${addictionUuid}`, 'PUT', params)
    }

    async getAllAddictions(): Promise<any> {
        return await this.request(`/user/addictions/all/list`, 'GET')
    }
    
    async deleteAddiction(addictionUuid: any): Promise<any> {
        return await this.request(`/user/addictions/${addictionUuid}`, 'DELETE')
    }
}

export const addictionService = new AddictionService()