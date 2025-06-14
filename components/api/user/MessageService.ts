import BaseAPIService from '@/components/api/BaseAPIService'

class MessageService extends BaseAPIService {
    async fetchChats(): Promise<any> {
        return await this.request(`/user/chats`, 'GET')
    }

    async fetchChat(chatUuid: any): Promise<any> {
        return await this.request(`/user/chats/${chatUuid}`, 'GET')
    }

    async fetchChatHistory(params: object): Promise<any> {
        return await this.request(`/user/chat-messages`, 'GET', params)
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
        return await this.request(`/user/chat_message_attachments/${attachmentUuid}/download`, 'POST')
    }

}

export const messageService = new MessageService()