import BaseAPIService from '@/components/api/BaseAPIService'

class RoadmapItemService extends BaseAPIService {
    async getRoadmapItems(): Promise<any> {
        return await this.request(`/user/roadmap-items`, 'GET')
    }
}

export const roadmapItemService = new RoadmapItemService()
