import BaseAPIService from '@/components/api/BaseAPIService'
import type { CodyMemory } from '@/composables/codyMemory'

// What Cody AI remembers about the signed-in user. Their own only: the backend
// has no route to anyone else's, and refuses support signed in as them.
const BASE = '/user/cody/memories'

export interface CodyMemoryList {
    data: CodyMemory[]
    meta?: { limit: number, max_length: number }
}

class CodyMemoryService extends BaseAPIService {
    async list(): Promise<CodyMemoryList> {
        return await this.request(BASE, 'GET')
    }

    async forget(uuid: string): Promise<any> {
        return await this.request(`${BASE}/${uuid}`, 'DELETE')
    }

    async forgetAll(): Promise<any> {
        return await this.request(BASE, 'DELETE')
    }
}

export const codyMemoryService = new CodyMemoryService()
