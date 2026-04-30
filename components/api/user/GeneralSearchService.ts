import BaseAPIService from '@/components/api/BaseAPIService'

class GeneralSearchService extends BaseAPIService {
    async search(params: object, signal?: AbortSignal): Promise<any> {
        return await this.request('/user/general-search', 'GET', params, signal)
    }
}

export const generalSearchService = new GeneralSearchService()
