import BaseAPIService from '@/components/api/BaseAPIService'

class JournalContentService extends BaseAPIService {
    async getJournalContents(params: object): Promise<any> {
        return await this.request(`/user/journal-contents`, 'GET', params)
    }

    async getJournalContent(journalContentUuid: any): Promise<any> {
        return await this.request(`/user/journal-contents/${journalContentUuid}`, 'GET')
    }

    async saveJournalContent(params: object): Promise<any> {
        return await this.request(`/user/journal-contents`, 'POST', params)
    }

    async updateJournalContent(journalContentUuid: any, params: object): Promise<any> {
        return await this.request(`/user/journal-contents/${journalContentUuid}`, 'PUT', params)
    }

    async deleteJournalContent(journalContentUuid: any): Promise<any> {
        return await this.request(`/user/journal-contents/${journalContentUuid}`, 'DELETE')
    }
}

export const journalContentService = new JournalContentService()
