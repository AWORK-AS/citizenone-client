import BaseAPIService from '@/components/api/BaseAPIService'

class MessageService extends BaseAPIService {
    async fetchChats(): Promise<any> {
        return await this.request(`/relative/chats`, 'GET')
    }

    async fetchChat(chatUuid: any): Promise<any> {
        return await this.request(`/relative/chats/${chatUuid}`, 'GET')
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

    async readChat(params: object): Promise<any> {
        return await this.request(`/relative/chat-message-receipts`, 'POST', params)
    }

    async getGroupMembers(params: object): Promise<any> {
        return await this.request(`/relative/chat-members`, 'GET', params)
    }

    async getAllAvailableUsers(params: object = {}): Promise<any> {
        return await this.request(`/relative/chat-members/all/list`, 'GET', params)
    }

    async saveGroupMembers(params: object): Promise<any> {
        return await this.request(`/relative/chat-members`, 'POST', params)
    }

    async deleteGroupMember(chatMemberUuid: any): Promise<any> {
        return await this.request(`/relative/chat-members/${chatMemberUuid}`, 'DELETE')
    }

    async downloadAttachment(attachmentUuid: any): Promise<any> {
        return await this.request(`/relative/chat-message-attachments/${attachmentUuid}/download`, 'POST')
    }

}

export const messageService = new MessageService()