import BaseAPIService from '@/components/api/BaseAPIService'

class AiConversationService extends BaseAPIService {
    async getConversations(params: object = {}): Promise<any> {
        return await this.request(`/user/own-chatgpt/conversations`, 'GET', params)
    }

    async getConversationMessages(uuid: any): Promise<any> {
        return await this.request(`/user/own-chatgpt/conversations/${uuid}`, 'GET')
    }

    async deleteConversation(uuid: any): Promise<any> {
        return await this.request(`/user/own-chatgpt/conversations/${uuid}`, 'DELETE')
    }

    async updateConversationTitle(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/own-chatgpt/conversations/${uuid}`, 'PUT', params)
    }

    async rateMessage(uuid: string, params: { rating: 'up' | 'down' | null, reason?: string | null }): Promise<any> {
        return await this.request(`/user/own-chatgpt/conversations/messages/${uuid}/feedback`, 'PUT', params)
    }
}

export const aiConversationService = new AiConversationService()
