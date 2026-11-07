import BaseAPIService from '@/components/api/BaseAPIService'

// Tasks Cody AI proposed. Cody AI never creates one on its own: only the
// user's "Opret opgave" does, and it sends the server's token, never the task.
const BASE = '/user/cody/task-proposals'

class CodyTaskProposalService extends BaseAPIService {
    async confirm(token: string): Promise<any> {
        return await this.request(`${BASE}/${encodeURIComponent(token)}`, 'POST')
    }

    async decline(token: string): Promise<any> {
        return await this.request(`${BASE}/${encodeURIComponent(token)}`, 'DELETE')
    }
}

export const codyTaskProposalService = new CodyTaskProposalService()
