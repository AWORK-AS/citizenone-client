import BaseAPIService from '@/components/api/BaseAPIService'

class AIAssistantService extends BaseAPIService {
    async sendMessage(params: object): Promise<any> {
        return await this.request(`/user/chat-gpt`, 'POST', params)
    }

    async generateNote(params: object): Promise<any> {
        return await this.request(`/user/chat-gpt/journal-prompt`, 'POST', params)
    }

    async deleteThread(conversationId: string, params: object): Promise<any> {
        return await this.request(`/user/chat-gpt/thread/${conversationId}`, 'DELETE', params)
    }

    async previewPrompt(params: object): Promise<any> {
        return await this.request(`/user/chat-gpt/preview-prompt`, 'POST', params)
    }

    async generateHandover(params: object): Promise<any> {
        return await this.request(`/user/handover/summary`, 'POST', params)
    }
}

export const aIAssistantService = new AIAssistantService()