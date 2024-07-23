import BaseAPIService from '@/components/api/BaseAPIService'

class NewsService extends BaseAPIService {
    async getNews(): Promise<any> {
        return await this.request(`/user/news`, 'GET')
    }
}

export const newsService = new NewsService()