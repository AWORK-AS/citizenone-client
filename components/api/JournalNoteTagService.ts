import BaseAPIService from '@/components/api/BaseAPIService'

class JournalNoteTagService extends BaseAPIService {
    async getJournalNoteTags(params: object): Promise<any> {
        return await this.request(`/user/journal-tags`, 'GET', params)
    }

    async getJournalNoteTag(JournalNoteTagUuid: any): Promise<any> {
        return await this.request(`/user/journal-tags/${JournalNoteTagUuid}`, 'GET')
    }

    async saveJournalNoteTag(params: object): Promise<any> {
        return await this.request(`/user/journal-tags`, 'POST', params)
    }

    async updateJournalNoteTag(JournalNoteTagUuid: any, params: object): Promise<any> {
        return await this.request(`/user/journal-tags/${JournalNoteTagUuid}`, 'PUT', params)
    }

    async deleteJournal(JournalNoteTagUuid: any): Promise<any> {
        return await this.request(`/user/journal-tags/${JournalNoteTagUuid}`, 'DELETE')
    }

    async getAllJournals(): Promise<any> {
        return await this.request(`/user/journal-tags/all/list`, 'GET')
    }
}

export const journalNoteTagService = new JournalNoteTagService()