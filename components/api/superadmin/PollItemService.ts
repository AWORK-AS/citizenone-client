import BaseAPIService from '@/components/api/BaseAPIService'

class PollItemService extends BaseAPIService {
    async getPollItems(params: object): Promise<any> {
        return await this.request(`/superadmin/poll-items`, 'GET', params)
    }

    async getPollItem(pollItemUuid: any): Promise<any> {
        return await this.request(`/superadmin/poll-items/${pollItemUuid}`, 'GET')
    }

    async savePollItem(params: object): Promise<any> {
        return await this.request(`/superadmin/poll-items`, 'POST', params)
    }

    async updatePollItem(pollItemUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/poll-items/${pollItemUuid}`, 'PUT', params)
    }
}

export const pollItemService = new PollItemService()