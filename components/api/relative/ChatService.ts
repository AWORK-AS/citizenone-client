import BaseAPIService from '@/components/api/BaseAPIService'

class ChatService extends BaseAPIService {
    async fetchChats(): Promise<any> {
        return await this.request(`/relative/chats`, 'GET')
    }

    async fetchChat(chatUuid: any): Promise<any> {
        return await this.request(`/relative/chats/${chatUuid}`, 'GET')
    }

    async fetchRecipients(): Promise<any> {
        return await this.request(`/relative/chats/recipients/list`, 'GET')
    }

    async fetchChatHistory(params: object): Promise<any> {
        return await this.request(`/relative/chat-messages`, 'GET', params)
    }

    async sendMessageViaReceiverUuid(params: object): Promise<any> {
        return await this.request(`/relative/chat-messages`, 'POST', params)
    }

    async sendMessageViaChatUuid(params: object): Promise<any> {
        return await this.request(`/relative/chat-messages/send/message`, 'POST', params)
    }
}

export const chatService = new ChatService()
