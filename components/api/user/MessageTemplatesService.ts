import BaseAPIService from '@/components/api/BaseAPIService'

class MessageTemplatesService extends BaseAPIService {
    async getMessageTemplates(params: object): Promise<any> {
        return await this.request(`/user/message-templates`, 'GET', params)
    }

    async listMessageTemplates(): Promise<any> {
        return await this.request(`/user/message-templates/all/list`, 'GET')
    }

    async getMessageTemplate(uuid: string): Promise<any> {
        return await this.request(`/user/message-templates/${uuid}`, 'GET')
    }

    async saveMessageTemplate(params: object): Promise<any> {
        return await this.request(`/user/message-templates`, 'POST', params)
    }

    async updateMessageTemplate(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/message-templates/${uuid}`, 'PUT', params)
    }

    async deleteMessageTemplate(uuid: string): Promise<any> {
        return await this.request(`/user/message-templates/${uuid}`, 'DELETE')
    }
}

export const messageTemplatesService = new MessageTemplatesService()
