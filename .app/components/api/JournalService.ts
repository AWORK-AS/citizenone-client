import BaseAPIService from '@/components/api/BaseAPIService'

class JournalService extends BaseAPIService {
    async getJournals(params: object): Promise<any> {
        return await this.request(`/user/citizen-journals`, 'GET', params)
    }

    async saveJournal(params: object): Promise<any> {
        return await this.request(`/user/citizen-journals`, 'POST', params)
    }

    async updateJournalFavorite(journalUuid: any): Promise<any> {
        return await this.request(`/user/citizen-journals/${journalUuid}/favorite`, 'PUT')
    }

    async updateJournalLock(journalUuid: any): Promise<any> {
        return await this.request(`/user/citizen-journals/${journalUuid}/lock`, 'PUT')
    }
}

export const journalService = new JournalService()