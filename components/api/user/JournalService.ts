import BaseAPIService from '@/components/api/BaseAPIService'

class JournalService extends BaseAPIService {
    async getJournals(params: object): Promise<any> {
        return await this.request(`/user/citizen-journals`, 'GET', params)
    }

    async getJournal(journalUuid: any): Promise<any> {
        return await this.request(`/user/citizen-journals/${journalUuid}`, 'GET')
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

    async copyJournal(journalUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-journals/${journalUuid}/copy`, 'POST', params)
    }

    async moveJournal(journalUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-journals/${journalUuid}/move`, 'POST', params)
    }

    async deleteJournal(journalUuid: any): Promise<any> {
        return await this.request(`/user/citizen-journals/${journalUuid}`, 'DELETE')
    }

    async downloadJournals(params: object): Promise<any> {
        return await this.request(`/user/citizen-journals/download/reports`, 'GET', params)
    }

    async uploadJournalFile(params: object): Promise<any> {
        return await this.request(`/user/journal-attachments`, 'POST', params)
    }

    async uploadAssessmentFile(params: object): Promise<any> {
        return await this.request(`/user/assessment-attachments`, 'POST', params)
    }

    async getJournalLogs(params: object): Promise<any> {
        return await this.request(`/user/change-logs`, 'GET', params)
    }

    async getDeletedJournalLogs(params: object): Promise<any> {
        return await this.request(`/user/citizen-journals/deleted/histories`, 'GET', params)
    }

    async shareJournal(journalUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-journals/${journalUuid}/share`, 'POST', params)
    }
}

export const journalService = new JournalService()