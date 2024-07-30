import BaseAPIService from '@/components/api/BaseAPIService'

class NewsService extends BaseAPIService {
    async getNews(params: object): Promise<any> {
        return await this.request(`/superadmin/news`, 'GET', params)
    }

    async getSelectedNews(newsUuid: any): Promise<any> {
        return await this.request(`/superadmin/news/${newsUuid}`, 'GET')
    }

    async saveNews(params: object): Promise<any> {
        return await this.request(`/superadmin/news`, 'POST', params)
    }

    async updateNews(newsUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/news/${newsUuid}/update`, 'POST', params)
    }
}

export const newsService = new NewsService()