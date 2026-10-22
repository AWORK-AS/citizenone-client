import BaseAPIService from '@/components/api/BaseAPIService'
import type { SuggestionStatus } from '@/composables/managerSuggestion'

export interface SuggestionResult {
    sent: boolean
    reason?: string
    recipients?: number
}

class ManagerSuggestionService extends BaseAPIService {
    async getStatus(appUuid: string): Promise<SuggestionStatus | null> {
        const response: any = await this.request(`/user/apps/${appUuid}/manager-suggestion`, 'GET')
        return response?.data ?? null
    }

    async send(appUuid: string, recipients: string[], message: string): Promise<SuggestionResult> {
        const response: any = await this.request(`/user/apps/${appUuid}/manager-suggestion`, 'POST', { recipients, message })
        return response?.data ?? response
    }
}

export const managerSuggestionService = new ManagerSuggestionService()
