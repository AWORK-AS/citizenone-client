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

    async getPopup(route: string): Promise<any> {
        return await this.request(`/user/release-notes/popup?route=${encodeURIComponent(route)}`, 'GET')
    }

    async dismissPopup(uuid: string): Promise<any> {
        return await this.request(`/user/release-notes/${uuid}/popup/dismiss`, 'POST')
    }
}

export const releaseNoteService = new ReleaseNoteService()
