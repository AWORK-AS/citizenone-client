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

    async transcribeAudio(params: object): Promise<any> {
        return await this.request(`/user/chat-gpt/transcribe`, 'POST', params)
    }
}

export const aIAssistantService = new AIAssistantService()