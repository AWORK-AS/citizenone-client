import BaseAPIService from '@/components/api/BaseAPIService'

class ReleaseNoteService extends BaseAPIService {
    async getReleaseNotes(): Promise<any> {
        return await this.request(`/user/release-notes`, 'GET')
    }

    async getUnseenCount(): Promise<any> {
        return await this.request(`/user/release-notes/unseen-count`, 'GET')
    }

    async markSeen(): Promise<any> {
        return await this.request(`/user/release-notes/seen`, 'PUT')
    }
}

export const releaseNoteService = new ReleaseNoteService()
