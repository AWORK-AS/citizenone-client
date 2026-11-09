import BaseAPIService from '@/components/api/BaseAPIService'

// Records Cody AI proposed (a task, a journal draft). Cody AI never writes one
// on its own: only the user's button does, and it sends the server's token,
// never the record.
const BASE = '/user/cody/proposals'

class CodyProposalService extends BaseAPIService {
    async confirm(token: string): Promise<any> {
        return await this.request(`${BASE}/${encodeURIComponent(token)}`, 'POST')
    }

    async decline(token: string): Promise<any> {
        return await this.request(`${BASE}/${encodeURIComponent(token)}`, 'DELETE')
    }
}

export const codyProposalService = new CodyProposalService()
