import BaseAPIService from '@/components/api/BaseAPIService'

class DemoDataService extends BaseAPIService {
    async status(): Promise<any> {
        return await this.request(`/user/demo-data`, 'GET')
    }

    async destroy(): Promise<any> {
        return await this.request(`/user/demo-data`, 'DELETE')
    }
}

export const demoDataService = new DemoDataService()
