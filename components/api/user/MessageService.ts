import BaseAPIService from '@/components/api/BaseAPIService'

/** The message after a pin or unpin (ChatMessageResource; only the fields the chat reads). */
export interface PinnedChatMessageResponse {
    data?: {
        uuid: string
        pinned_at: string | null
        pinned_by?: { uuid: string; name: string } | null
    }
}

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

    async pinChat(chatUuid: any): Promise<any> {
        return await this.request(`/user/chats/${chatUuid}/pin`, 'POST')
    }

    async unpinChat(chatUuid: any): Promise<any> {
        return await this.request(`/user/chats/${chatUuid}/pin`, 'DELETE')
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

    // Roadmap #375: a pinned message is shared by everyone in the chat. 422 when
    // the chat already has its maximum of pins; 404 for a non-member.
    async pinChatMessage(messageUuid: string): Promise<PinnedChatMessageResponse> {
        return await this.request(`/user/chat-messages/${messageUuid}/pin`, 'POST')
    }

    async unpinChatMessage(messageUuid: string): Promise<PinnedChatMessageResponse> {
        return await this.request(`/user/chat-messages/${messageUuid}/pin`, 'DELETE')
    }

    async updateGroupChatName(chatUuid: any, params: object): Promise<any> {
        return await this.request(`/user/chats/${chatUuid}`, 'PUT', params)
    }

    async sendMessageViaReceiverUuid(params: object): Promise<any> {
        return await this.request(`/user/chat-messages`, 'POST', params)
    }

    // Roadmap #501: a group chat whose members follow a department or an employee group.
    async createLinkedChat(params: object): Promise<any> {
        return await this.request(`/user/chats`, 'POST', params)
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

    async previewExport(chatUuid: any, from: string, to: string): Promise<any> {
        return await this.request(`/user/chats/${chatUuid}/export/preview`, 'GET', { from, to })
    }

    async downloadExport(chatUuid: any, from: string, to: string, onHeaders?: (headers: Headers) => void): Promise<Blob | null> {
        return await this.requestBlob(`/user/chats/${chatUuid}/export`, 'GET', { from, to }, onHeaders)
    }
}

export const messageService = new MessageService()