import BaseAPIService from '@/components/api/BaseAPIService'

class JournalNoteTagService extends BaseAPIService {
    async getJournalNoteTags(params: object): Promise<any> {
        return await this.request(`/user/journal-tags`, 'GET', params)
    }

    async getJournalNoteTag(journalNoteTagUuid: any): Promise<any> {
        return await this.request(`/user/journal-tags/${journalNoteTagUuid}`, 'GET')
    }

    async saveJournalNoteTag(params: object): Promise<any> {
        return await this.request(`/user/journal-tags`, 'POST', params)
    }

    async updateJournalNoteTag(journalNoteTagUuid: any, params: object): Promise<any> {
        return await this.request(`/user/journal-tags/${journalNoteTagUuid}`, 'PUT', params)
    }

    async deleteJournalNoteTag(journalNoteTagUuid: any): Promise<any> {
        return await this.request(`/user/journal-tags/${journalNoteTagUuid}`, 'DELETE')
    }

    async getAllJournalNoteTags(params: object): Promise<any> {
        return await this.request(`/user/journal-tags/all/list`, 'GET', params)
    }
}

export const journalNoteTagService = new JournalNoteTagService()