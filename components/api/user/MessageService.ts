import BaseAPIService from '@/components/api/BaseAPIService'

class MessageService extends BaseAPIService {
    async fetchChats(params: object): Promise<any> {
        return await this.request(`/user/chats`, 'GET', params)
    }

    async fetchChat(chatUuid: any): Promise<any> {
        return await this.request(`/user/chats/${chatUuid}`, 'GET')
    }

    async deleteChatHistory(chatUuid: any): Promise<any> {
        return await this.request(`/user/chats/${chatUuid}/clear`, 'POST')
    }

    async fetchChatHistory(params: object): Promise<any> {
        return await this.request(`/user/chat-messages`, 'GET', params)
    }

    async updateChatMessage(chatUuid: any, params: object): Promise<any> {
        return await this.request(`/user/chat-messages/${chatUuid}`, 'PUT', params)
    }

    async deleteChatMessage(chatUuid: any): Promise<any> {
        return await this.request(`/user/chat-messages/${chatUuid}`, 'DELETE')
    }

    async updateGroupChatName(chatUuid: any, params: object): Promise<any> {
        return await this.request(`/user/chats/${chatUuid}`, 'PUT', params)
    }

    async sendMessageViaReceiverUuid(params: object): Promise<any> {
        return await this.request(`/user/chat-messages`, 'POST', params)
    }

    async sendMessageViaChatUuid(params: object): Promise<any> {
        return await this.request(`/user/chat-messages/send/message`, 'POST', params)
    }

    async readChat(params: object): Promise<any> {
        return await this.request(`/user/chat-message-receipts`, 'POST', params)
    }

    async getGroupMembers(params: object): Promise<any> {
        return await this.request(`/user/chat-members`, 'GET', params)
    }

    async getAllAvailableUsers(params: object = {}): Promise<any> {
        return await this.request(`/user/chat-members/all/list`, 'GET', params)
    }

    async saveGroupMembers(params: object): Promise<any> {
        return await this.request(`/user/chat-members`, 'POST', params)
    }

    async deleteGroupMember(chatMemberUuid: any): Promise<any> {
        return await this.request(`/user/chat-members/${chatMemberUuid}`, 'DELETE')
    }

    async downloadAttachment(attachmentUuid: any): Promise<any> {
        return await this.request(`/user/chat-message-attachments/${attachmentUuid}/download`, 'POST')
    }
}

export const messageService = new MessageService()