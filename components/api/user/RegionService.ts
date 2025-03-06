import BaseAPIService from '@/components/api/BaseAPIService'

class RegionService extends BaseAPIService {
    async getAllRegions(): Promise<any> {
        return await this.request(`/user/regions`, 'GET')
    }
}

export const regionService = new RegionService()