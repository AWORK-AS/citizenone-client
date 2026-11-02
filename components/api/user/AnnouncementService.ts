import BaseAPIService from '@/components/api/BaseAPIService'

/** "Nyt fra CitizenOne" for the logged-in user. Every write is on their own receipt. */
class AnnouncementService extends BaseAPIService {
    async getNext(): Promise<any> {
        return await this.request(`/user/announcements/next`, 'GET')
    }

    async getRecent(): Promise<any> {
        return await this.request(`/user/announcements`, 'GET')
    }

    async markSeen(uuid: string): Promise<any> {
        return await this.request(`/user/announcements/${uuid}/seen`, 'PUT')
    }

    async markClicked(uuid: string, action: string | null): Promise<any> {
        return await this.request(`/user/announcements/${uuid}/click`, 'PUT', { action })
    }

    async dismiss(uuid: string): Promise<any> {
        return await this.request(`/user/announcements/${uuid}/dismiss`, 'PUT')
    }

    async snooze(uuid: string): Promise<any> {
        return await this.request(`/user/announcements/${uuid}/snooze`, 'PUT')
    }
}

export const announcementService = new AnnouncementService()
