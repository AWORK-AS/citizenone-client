import BaseAPIService from '@/components/api/BaseAPIService'

class JournalService extends BaseAPIService {
    async getJournals(params: object): Promise<any> {
        return await this.request(`/relative/citizen-journals`, 'GET', params)
    }

    async getJournal(journalUuid: any): Promise<any> {
        return await this.request(`/relative/citizen-journals/${journalUuid}`, 'GET')
    }
}

export const journalService = new JournalService()