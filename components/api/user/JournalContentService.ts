import BaseAPIService from '@/components/api/BaseAPIService'

class JournalContentService extends BaseAPIService {

    async saveJournalContent(params: object): Promise<any> {
        return await this.request(`/user/journal-contents`, 'POST', params)
    }
}

export const journalContentService = new JournalContentService()