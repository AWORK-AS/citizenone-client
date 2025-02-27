import BaseAPIService from '@/components/api/user/BaseAPIService'

class RegionService extends BaseAPIService {
    async getAllRegions(): Promise<any> {
        return await this.request(`/user/regions`, 'GET')
    }
}

export const regionService = new RegionService()