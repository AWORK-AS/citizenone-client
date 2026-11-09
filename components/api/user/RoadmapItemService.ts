import BaseAPIService from '@/components/api/BaseAPIService'

class RoadmapItemService extends BaseAPIService {
    async getRoadmapItems(): Promise<any> {
        return await this.request(`/user/roadmap-items`, 'GET')
    }

    async setInterest(uuid: string, interested: boolean): Promise<any> {
        return await this.request(`/user/roadmap-items/${uuid}/interest`, interested ? 'PUT' : 'DELETE')
    }
}

export const roadmapItemService = new RoadmapItemService()
