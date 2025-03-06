import BaseAPIService from '@/components/api/user/BaseAPIService'

class RelativeService extends BaseAPIService {
    async getCurrentLoggedInRelative(): Promise<any> {
        return await this.request(`/relative`, 'GET')
    }

    async updateRelativeLangugage(params: object): Promise<any> {
        return await this.request(`/relative/update/language`, 'PUT', params)
    }
}

export const relativeService = new RelativeService()