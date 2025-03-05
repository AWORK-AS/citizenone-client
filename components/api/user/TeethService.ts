import BaseAPIService from '@/components/api/user/BaseAPIService'

class TeethService extends BaseAPIService {
    async getAllTeeth(): Promise<any> {
        return await this.request(`/user/teeth/all/list`, 'GET')
    }
}

export const teethService = new TeethService()