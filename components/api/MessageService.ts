import BaseAPIService from '@/components/api/BaseAPIService'

class MessageService extends BaseAPIService {
    async fetchChats(): Promise<any> {
        return await this.request(`/user/chats`, 'GET')
    }

    async fetchChatHistory(params: object): Promise<any> {
        return await this.request(`/user/chat-messages`, 'GET', params)
    }

    async sendMessageViaReceiverUuid(params: object): Promise<any> {
        return await this.request(`/user/chat-messages`, 'POST', params)
    }

    async sendMessageViaChatUuid(params: object): Promise<any> {
        return await this.request(`/user/chat-messages`, 'POST', params)
    }
}

export const messageService = new MessageService()