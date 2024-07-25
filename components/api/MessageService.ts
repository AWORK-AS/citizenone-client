import BaseAPIService from '@/components/api/BaseAPIService'

class MessageService extends BaseAPIService {
    async fetchChattedUsers(): Promise<any> {
        return await this.request(`/user/conversations/user/list`, 'GET')
    }

    async fetchChatHistory(params: object): Promise<any> {
        return await this.request(`/user/conversations`, 'GET', params)
    }

    async sendMessage(params: object): Promise<any> {
        return await this.request(`/user/conversations`, 'POST', params)
    }
}

export const messageService = new MessageService()