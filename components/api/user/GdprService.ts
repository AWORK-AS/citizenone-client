import BaseAPIService from '@/components/api/BaseAPIService'

class GdprService extends BaseAPIService {
    // Retention settings
    async getRetentionSettings(): Promise<any> {
        return await this.request(`/user/gdpr/retention-settings`, 'GET')
    }

    async saveRetentionSettings(params: object): Promise<any> {
        return await this.request(`/user/gdpr/retention-settings`, 'POST', params)
    }

    // What the status/journal rule would delete right now
    async getStatusJournalPreview(): Promise<any> {
        return await this.request(`/user/gdpr/retention-settings/status-journal-preview`, 'GET')
    }

    // The status/journal rule on its own: available to every company, whatever its sector
    async getStatusJournalRule(): Promise<any> {
        return await this.request(`/user/gdpr/status-journal-retention`, 'GET')
    }

    async saveStatusJournalRule(params: object): Promise<any> {
        return await this.request(`/user/gdpr/status-journal-retention`, 'POST', params)
    }

    // Scheduled deletions
    async getScheduledDeletions(params: object = {}): Promise<any> {
        return await this.request(`/user/gdpr/scheduled-deletions`, 'GET', params)
    }

    async cancelScheduledDeletion(citizenUuid: string): Promise<any> {
        return await this.request(`/user/gdpr/scheduled-deletions/${citizenUuid}/cancel`, 'POST')
    }

    // Citizen recovery
    async restoreCitizen(citizenUuid: string): Promise<any> {
        return await this.request(`/user/gdpr/citizens/${citizenUuid}/restore`, 'POST')
    }

    // Deletion audit log
    async getDeletionLog(params: object = {}): Promise<any> {
        return await this.request(`/user/gdpr/deletion-log`, 'GET', params)
    }
}

export const gdprService = new GdprService()
