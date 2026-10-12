import BaseAPIService from '@/components/api/BaseAPIService'

// "Del CitizenOne" (task #16): the user's own link, and a log of each time they share it.
class PlatformShareService extends BaseAPIService {
    async getMyLink(): Promise<any> {
        return await this.request(`/user/platform-share`, 'GET')
    }

    async recordShare(params: { method: string }): Promise<any> {
        return await this.request(`/user/platform-share`, 'POST', params)
    }
}

export const platformShareService = new PlatformShareService()
