import BaseAPIService from '@/components/api/BaseAPIService'

class ReleaseNoteService extends BaseAPIService {
    async getReleaseNotes(): Promise<any> {
        return await this.request(`/superadmin/release-notes`, 'GET')
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

    async publishReleaseNote(uuid: string): Promise<any> {
        return await this.request(`/superadmin/release-notes/${uuid}/publish`, 'PUT')
    }

    async deleteReleaseNote(uuid: string): Promise<any> {
        return await this.request(`/superadmin/release-notes/${uuid}`, 'DELETE')
    }
}

export const releaseNoteService = new ReleaseNoteService()
