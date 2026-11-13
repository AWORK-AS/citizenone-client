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

    async importRoadmapItems(items: object[], dryRun: boolean): Promise<any> {
        return await this.request(`/superadmin/roadmap-items/import`, 'POST', { items, dry_run: dryRun })
    }

    async addRoadmapRequest(uuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/roadmap-items/${uuid}/requests`, 'POST', params)
    }

    async removeRoadmapRequest(uuid: string, requestUuid: string): Promise<any> {
        return await this.request(`/superadmin/roadmap-items/${uuid}/requests/${requestUuid}`, 'DELETE')
    }

    async getWishes(status = ''): Promise<any> {
        return await this.request(`/superadmin/wishes${status ? `?status=${status}` : ''}`, 'GET')
    }

    async wishToRoadmap(uuid: string, params: { roadmap_item_uuid?: string, title?: string, description?: string }): Promise<any> {
        return await this.request(`/superadmin/wishes/${uuid}/roadmap`, 'POST', params)
    }

    async updateWishStatus(uuid: string, status: 'new' | 'declined'): Promise<any> {
        return await this.request(`/superadmin/wishes/${uuid}/status`, 'PUT', { status })
    }

    // expectedWorkerUuid: who the page showed as working on it (null: nobody). The backend
    // refuses with 409 when that is no longer true, instead of overwriting a colleague.
    async setWorking(uuid: string, working: boolean, expectedWorkerUuid: string | null): Promise<any> {
        return await this.request(`/superadmin/roadmap-items/${uuid}/working`, 'PUT', { working, expected_worker_uuid: expectedWorkerUuid })
    }

    async reorderRoadmapItems(items: { uuid: string, sort_order: number }[]): Promise<any> {
        return await this.request(`/superadmin/roadmap-items/reorder`, 'POST', { items })
    }
}

export const roadmapItemService = new RoadmapItemService()
