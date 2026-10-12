import BaseAPIService from '@/components/api/BaseAPIService'

class RoadmapItemService extends BaseAPIService {
    async getRoadmapItems(params: object = {}): Promise<any> {
        return await this.request(`/superadmin/roadmap-items`, 'GET', params)
    }

    async getRoadmapItem(uuid: string): Promise<any> {
        return await this.request(`/superadmin/roadmap-items/${uuid}`, 'GET')
    }

    async saveRoadmapItem(params: object): Promise<any> {
        return await this.request(`/superadmin/roadmap-items`, 'POST', params)
    }

    async updateRoadmapItem(uuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/roadmap-items/${uuid}`, 'PUT', params)
    }

    async deleteRoadmapItem(uuid: string): Promise<any> {
        return await this.request(`/superadmin/roadmap-items/${uuid}`, 'DELETE')
    }

    async reorderRoadmapItems(items: { uuid: string, sort_order: number }[]): Promise<any> {
        return await this.request(`/superadmin/roadmap-items/reorder`, 'POST', { items })
    }
}

export const roadmapItemService = new RoadmapItemService()
