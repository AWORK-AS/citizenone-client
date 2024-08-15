import BaseAPIService from '@/components/api/BaseAPIService'

class JournalService extends BaseAPIService {
    async getJournals(params: object): Promise<any> {
        return await this.request(`/user/citizen-journals`, 'GET', params)
    }

    async saveJournal(params: object): Promise<any> {
        return await this.request(`/user/citizen-journals`, 'POST', params)
    }

    async updateJournal(journalUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-journals/${journalUuid}`, 'PUT', params)
    }

    async updateJournalFavorite(journalUuid: any): Promise<any> {
        return await this.request(`/user/citizen-journals/${journalUuid}/favorite`, 'PUT')
    }

    async updateJournalLock(journalUuid: any): Promise<any> {
        return await this.request(`/user/citizen-journals/${journalUuid}/lock`, 'PUT')
    }

    async deleteJournal(journalUuid: any): Promise<any> {
        return await this.request(`/user/citizen-journals/${journalUuid}`, 'DELETE')
    }

    async downloadJournals(params: object): Promise<any> {
        return await this.request(`/user/citizen-journals/download`, 'GET', params)
    }
}

export const journalService = new JournalService()