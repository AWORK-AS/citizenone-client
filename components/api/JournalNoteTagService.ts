import BaseAPIService from '@/components/api/BaseAPIService'

class JournalNoteTagService extends BaseAPIService {
    async getJournalNoteTags(params: object): Promise<any> {
        return await this.request(`/user/journal-tags`, 'GET', params)
    }

    async getJournalNoteTag(JournalNoteTagUuid: any): Promise<any> {
        return await this.request(`/user/journal-tags/${JournalNoteTagUuid}`, 'GET')
    }

    async saveJournal(params: object): Promise<any> {
        return await this.request(`/user/journal-tags`, 'POST', params)
    }

    async updateJournal(JournalNoteTagUuid: any, params: object): Promise<any> {
        return await this.request(`/user/journal-tags/${JournalNoteTagUuid}`, 'PUT', params)
    }

    async getAllJournals(): Promise<any> {
        return await this.request(`/user/journal-tags/all/list`, 'GET')
    }

    async deleteJournal(JournalNoteTagUuid: any): Promise<any> {
        return await this.request(`/user/journal-tags/${JournalNoteTagUuid}`, 'DELETE')
    }
}

export const journalNoteTagService = new JournalNoteTagService()