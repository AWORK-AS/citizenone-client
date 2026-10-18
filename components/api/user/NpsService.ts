import BaseAPIService from '@/components/api/BaseAPIService'

/** "Would you recommend CitizenOne?". See App\Service\NpsService in the backend. */
class NpsService extends BaseAPIService {
    async prompt(): Promise<{ data: { show: boolean, review_url: string } }> {
        return await this.request('/user/nps/prompt', 'GET')
    }

    async answer(params: { score: number, comment?: string | null }): Promise<{ data: { uuid: string, review_url: string } }> {
        return await this.request('/user/nps', 'POST', params)
    }

    async dismiss(): Promise<any> {
        return await this.request('/user/nps/dismiss', 'POST')
    }

    async reviewClicked(uuid: string): Promise<any> {
        return await this.request(`/user/nps/${uuid}/review-clicked`, 'POST')
    }
}

export const npsService = new NpsService()
