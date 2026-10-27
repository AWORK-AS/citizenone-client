import BaseAPIService from '@/components/api/BaseAPIService'
import type { CodyMemory } from '@/composables/codyMemory'

// What Cody AI remembers about the signed-in user. Their own only: the backend
// has no route to anyone else's, and refuses support signed in as them.
// Cody AI never stores on its own; a memory exists only after the user's "Ja".
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

    // "Ja" to a memory Cody AI proposed. Only the server's token is sent: the
    // stored text is the text the server held, never text from the browser.
    async confirm(token: string): Promise<any> {
        return await this.request(`${BASE}/confirm`, 'POST', { token })
    }

    async decline(token: string): Promise<any> {
        return await this.request(`${BASE}/decline`, 'POST', { token })
    }
}

export const codyMemoryService = new CodyMemoryService()
