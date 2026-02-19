import BaseAPIService from '@/components/api/BaseAPIService'

class JournalService extends BaseAPIService {
    async unlockJournal(sharedJournalUuid: any, params: object): Promise<any> {
        return await this.request(`/guest/share/${sharedJournalUuid}/unlock`, 'POST', params)
    }
}

export const journalService = new JournalService()