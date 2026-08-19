import BaseAPIService from '@/components/api/BaseAPIService'

class ReleaseNoteService extends BaseAPIService {
    async getReleaseNotes(params: object = {}): Promise<any> {
        return await this.request(`/superadmin/release-notes`, 'GET', params)
    }

    async getReleaseNote(uuid: string): Promise<any> {
        return await this.request(`/superadmin/release-notes/${uuid}`, 'GET')
    }

    async createReleaseNote(params: object): Promise<any> {
        return await this.request(`/superadmin/release-notes`, 'POST', params)
    }

    async updateReleaseNote(uuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/release-notes/${uuid}`, 'PUT', params)
    }

    // Ask the approver again, for a note whose first request never arrived.
    async notifyApprover(uuid: string): Promise<any> {
        return await this.request(`/superadmin/release-notes/${uuid}/notify`, 'POST')
    }

    async publishReleaseNote(uuid: string): Promise<any> {
        return await this.request(`/superadmin/release-notes/${uuid}/publish`, 'PUT')
    }

    async unpublishReleaseNote(uuid: string): Promise<any> {
        return await this.request(`/superadmin/release-notes/${uuid}/unpublish`, 'PUT')
    }

    async deleteReleaseNote(uuid: string): Promise<any> {
        return await this.request(`/superadmin/release-notes/${uuid}`, 'DELETE')
    }
}

export const releaseNoteService = new ReleaseNoteService()
