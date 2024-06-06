import BaseAPIService from '@/components/api/BaseAPIService'

class JournalService extends BaseAPIService {
    async getJournals(params: object): Promise<any> {
        return await this.request(`/user/citizen-journals`, 'GET', params)
    }

    async saveJournal(params: object): Promise<any> {
        return await this.request(`/user/citizen-journals`, 'POST', params)
    }
}

export const journalService = new JournalService()