import BaseAPIService from '@/components/api/BaseAPIService'

/** "Nyt fra CitizenOne": the popup messages (try the new app, news, tips). */
class AnnouncementService extends BaseAPIService {
    async getAnnouncements(params: object = {}): Promise<any> {
        return await this.request(`/superadmin/announcements`, 'GET', params)
    }

    // Multipart: a message can carry an image.
    async createAnnouncement(form: FormData): Promise<any> {
        return await this.requestFormData(`/superadmin/announcements`, form)
    }

    // POST with _method=PUT in the body, since PHP does not parse a PUT with a file body.
    async updateAnnouncement(uuid: string, form: FormData): Promise<any> {
        return await this.requestFormData(`/superadmin/announcements/${uuid}`, form)
    }

    async publishAnnouncement(uuid: string): Promise<any> {
        return await this.request(`/superadmin/announcements/${uuid}/publish`, 'PUT')
    }

    async unpublishAnnouncement(uuid: string): Promise<any> {
        return await this.request(`/superadmin/announcements/${uuid}/unpublish`, 'PUT')
    }

    async deleteAnnouncement(uuid: string): Promise<any> {
        return await this.request(`/superadmin/announcements/${uuid}`, 'DELETE')
    }
}

export const announcementService = new AnnouncementService()
