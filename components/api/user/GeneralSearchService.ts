import BaseAPIService from '@/components/api/BaseAPIService'

class GeneralSearchService extends BaseAPIService {
    async search(params: object): Promise<any> {
        return await this.request(`/user/general-search`, 'GET', params)
    }
}

export const generalSearchService = new GeneralSearchService()
