import BaseAPIService from '@/components/api/BaseAPIService'

class GoalTypeService extends BaseAPIService {
    async getTypes(): Promise<any> {
        return await this.request(`/user/goal-types/all/list`, 'GET')
    }

    async saveType(params: object): Promise<any> {
        return await this.request(`/user/goal-types`, 'POST', params)
    }

    async updateType(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/goal-types/${uuid}`, 'PUT', params)
    }

    async deleteType(uuid: string): Promise<any> {
        return await this.request(`/user/goal-types/${uuid}`, 'DELETE')
    }

    async reorderTypes(uuids: string[]): Promise<any> {
        return await this.request(`/user/goal-types/reorder`, 'PUT', { uuids })
    }
}

export const goalTypeService = new GoalTypeService()
