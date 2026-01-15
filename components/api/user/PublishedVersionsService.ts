import BaseAPIService from '@/components/api/BaseAPIService'

class PublishedVersionsService extends BaseAPIService {
    async getPublishedVersions(params: object): Promise<any> {
        return await this.request(`/user/schedule-versions`, 'GET', params)
    }

    async getPublishedVersionDetails(uuid: string): Promise<any> {
        return await this.request(`/user/schedule-versions/${uuid}`, 'GET')
    }
}

export const publishedVersionsService = new PublishedVersionsService()