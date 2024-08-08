import BaseAPIService from '@/components/api/BaseAPIService'

class PollService extends BaseAPIService {
    async getPolls(params: object): Promise<any> {
        return await this.request(`/superadmin/polls`, 'GET', params)
    }

    async getPoll(pollUuid: any): Promise<any> {
        return await this.request(`/superadmin/polls/${pollUuid}`, 'GET')
    }

    async savePoll(params: object): Promise<any> {
        return await this.request(`/superadmin/polls`, 'POST', params)
    }

    async updatePoll(pollUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/polls/${pollUuid}`, 'PUT', params)
    }
}

export const pollService = new PollService()