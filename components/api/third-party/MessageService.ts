import BaseAPIService from '@/components/api/BaseAPIService'

class MessageService extends BaseAPIService {
    async fetchChats(): Promise<any> {
        return await this.request(`/third-party/chats`, 'GET')
    }

    async fetchChat(chatUuid: any): Promise<any> {
        return await this.request(`/third-party/chats/${chatUuid}`, 'GET')
    }

    async fetchChatHistory(params: object): Promise<any> {
        return await this.request(`/third-party/chat-messages`, 'GET', params)
    }

    async sendMessageViaReceiverUuid(params: object): Promise<any> {
        return await this.request(`/third-party/chat-messages`, 'POST', params)
    }

    async sendMessageViaChatUuid(params: object): Promise<any> {
        return await this.request(`/third-party/chat-messages/send/message`, 'POST', params)
    }

    async readChat(params: object): Promise<any> {
        return await this.request(`/third-party/chat-message-receipts`, 'POST', params)
    }

    async getChatMembers(params: object): Promise<any> {
        return await this.request(`/third-party/chat-members`, 'GET', params)
    }

    async getAllAvailableUsers(params: object = {}): Promise<any> {
        return await this.request(`/third-party/chat-members/all/list`, 'GET', params)
    }

    async downloadAttachment(attachmentUuid: any): Promise<any> {
        return await this.request(`/third-party/chat-message-attachments/${attachmentUuid}/download`, 'POST')
    }
}

export const messageService = new MessageService()
