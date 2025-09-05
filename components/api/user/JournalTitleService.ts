import BaseAPIService from '@/components/api/BaseAPIService'

class JournalTitleService extends BaseAPIService {
    async getJournalTitles(params: object): Promise<any> {
        return await this.request(`/user/journal-titles`, 'GET', params)
    }

    async getJournalTitle(journalTitleUuid: any): Promise<any> {
        return await this.request(`/user/journal-titles/${journalTitleUuid}`, 'GET')
    }

    async saveJournalTitle(params: object): Promise<any> {
        return await this.request(`/user/journal-titles`, 'POST', params)
    }

    async updateJournalTitle(journalTitleUuid: any, params: object): Promise<any> {
        return await this.request(`/user/journal-titles/${journalTitleUuid}`, 'PUT', params)
    }

    async deleteJournalTitle(journalTitleUuid: any): Promise<any> {
        return await this.request(`/user/journal-titles/${journalTitleUuid}`, 'DELETE')
    }

    async getAllJournalTitles(): Promise<any> {
        return await this.request(`/user/journal-titles/all/list`, 'GET')
    }
}

export const journalTitleService = new JournalTitleService()