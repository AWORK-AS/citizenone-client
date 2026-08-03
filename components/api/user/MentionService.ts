import BaseAPIService from '@/components/api/BaseAPIService'

class MentionService extends BaseAPIService {
    /**
     * Feed for the @-picker in the journal editor: colleagues and citizens.
     * Note the parameter is `term`, not `query`.
     */
    async searchMentions(params: object): Promise<any> {
        return await this.request(`/user/journal-mentions/search`, 'GET', params)
    }

    /**
     * Citizen mentions are stored as initials only, so the reader side asks
     * the API for the names behind them and whether it may open them.
     */
    async resolveCitizenMentions(uuids: string[]): Promise<any> {
        return await this.request(`/user/journal-mentions/citizens`, 'POST', { uuids })
    }
}

export const mentionService = new MentionService()
