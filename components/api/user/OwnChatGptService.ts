import BaseAPIService from '@/components/api/BaseAPIService'

class OwnChatGptService extends BaseAPIService {
    async saveApiKey(params: object): Promise<any> {
        return await this.request(`/user/own-chatgpt/api-key`, 'POST', params)
    }

    async sendMessage(params: object): Promise<any> {
        return await this.request(`/user/own-chatgpt/message`, 'POST', params)
    }
}

export const ownChatGptService = new OwnChatGptService()
