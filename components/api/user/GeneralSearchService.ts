import BaseAPIService from '@/components/api/BaseAPIService'

class GeneralSearchService extends BaseAPIService {
    async search(query: string, pageLength: number = 5, signal?: AbortSignal): Promise<any> {
        return await this.request('/user/general-search', 'GET', {
            search: JSON.stringify([query]),
            page_length: pageLength,
        }, signal)
    }
}

export const generalSearchService = new GeneralSearchService()
