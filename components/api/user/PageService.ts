import BaseAPIService from '@/components/api/BaseAPIService'

class PageService extends BaseAPIService {
    async getAllPages(): Promise<any> {
        return await this.request(`/user/pages/all/list`, 'GET')
    }
}

export const pageService = new PageService()