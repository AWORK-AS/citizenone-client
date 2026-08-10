import BaseAPIService from '@/components/api/BaseAPIService'

class AIAssistantService extends BaseAPIService {
    async sendMessage(params: object): Promise<any> {
        return await this.request(`/user/chat-gpt`, 'POST', params)
    }

    // Same request as sendMessage, answered as it is generated. onEvent receives
    // 'delta' fragments and finally 'done' with the payload sendMessage returns.
    async streamMessage(params: FormData, onEvent: (event: string, data: any) => void, signal?: AbortSignal): Promise<void> {
        return await this.requestStream(`/user/chat-gpt/stream`, params, onEvent, signal)
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

    async transcribeAudio(params: object): Promise<any> {
        return await this.request(`/user/chat-gpt/transcribe`, 'POST', params)
    }
}

export const aIAssistantService = new AIAssistantService()