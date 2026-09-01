import BaseAPIService from '@/components/api/BaseAPIService'

class PatientMessageService extends BaseAPIService {
    async fetchChats(): Promise<any> {
        return await this.request(`/patient/chats`, 'GET')
    }

    async fetchChat(chatUuid: any): Promise<any> {
        return await this.request(`/patient/chats/${chatUuid}`, 'GET')
    }

    async fetchChatHistory(params: object): Promise<any> {
        return await this.request(`/patient/chat-messages`, 'GET', params)
    }

    async sendMessageViaReceiverUuid(params: object): Promise<any> {
        return await this.request(`/patient/chat-messages`, 'POST', params)
    }

    async sendMessageViaChatUuid(params: object): Promise<any> {
        return await this.request(`/patient/chat-messages/send/message`, 'POST', params)
    }

    async readChat(params: object): Promise<any> {
        return await this.request(`/patient/chat-message-receipts`, 'POST', params)
    }

    async getGroupMembers(params: object): Promise<any> {
        return await this.request(`/patient/chat-members`, 'GET', params)
    }

    async getAllAvailableUsers(params: object = {}): Promise<any> {
        return await this.request(`/patient/chat-members/all/list`, 'GET', params)
    }

    async saveGroupMembers(params: object): Promise<any> {
        return await this.request(`/patient/chat-members`, 'POST', params)
    }

    async deleteGroupMember(chatMemberUuid: any): Promise<any> {
        return await this.request(`/patient/chat-members/${chatMemberUuid}`, 'DELETE')
    }

    async downloadAttachment(attachmentUuid: any): Promise<any> {
        return await this.request(`/patient/chat-message-attachments/${attachmentUuid}/download`, 'POST')
    }

}

export const patientMessageService = new PatientMessageService()