import BaseAPIService from '@/components/api/BaseAPIService'

class MessageService extends BaseAPIService {
    async sendMessage(params: object): Promise<any> {
        return await this.request(`/user/conversations`, 'POST', params)
    }
}

export const messageService = new MessageService()