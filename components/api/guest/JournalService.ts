import BaseAPIService from '@/components/api/BaseAPIService'

class JournalService extends BaseAPIService {
    async unlockJournal(sharedJournalUuid: any, params: object): Promise<any> {
        return await this.request(`/citizen-journals/${sharedJournalUuid}/unlock`, 'POST', params)
    }
}

export const journalService = new JournalService()