import BaseAPIService from '@/components/api/BaseAPIService'

class ReleaseNoteService extends BaseAPIService {
    async getReleaseNotes(params: object = {}): Promise<any> {
        return await this.request(`/superadmin/release-notes`, 'GET', params)
    }

    async getReleaseNote(uuid: string): Promise<any> {
        return await this.request(`/superadmin/release-notes/${uuid}`, 'GET')
    }

    // Multipart: a note can carry a screenshot.
    async createReleaseNote(form: FormData): Promise<any> {
        return await this.requestFormData(`/superadmin/release-notes`, form)
    }

    // POST with _method=PUT in the body, since a PUT with a file body is not
    // parsed by PHP.
    async updateReleaseNote(uuid: string, form: FormData): Promise<any> {
        return await this.requestFormData(`/superadmin/release-notes/${uuid}`, form)
    }

    // Ask the approver again, for a note whose first request never arrived.
    async notifyApprover(uuid: string): Promise<any> {
        return await this.request(`/superadmin/release-notes/${uuid}/notify`, 'POST')
    }

    // Where the note goes (public news, the support assistant) is decided in
    // the approval step itself.
    async publishReleaseNote(uuid: string, flags: { is_public?: boolean; send_to_milo?: boolean } = {}): Promise<any> {
        return await this.request(`/superadmin/release-notes/${uuid}/publish`, 'PUT', flags)
    }

    // Rewrite the draft again from all of its raw deploy items. Replaces edits.
    async regenerateReleaseNote(uuid: string): Promise<any> {
        return await this.request(`/superadmin/release-notes/${uuid}/regenerate`, 'POST')
    }

    async unpublishReleaseNote(uuid: string): Promise<any> {
        return await this.request(`/superadmin/release-notes/${uuid}/unpublish`, 'PUT')
    }

    async deleteReleaseNote(uuid: string): Promise<any> {
        return await this.request(`/superadmin/release-notes/${uuid}`, 'DELETE')
    }
}

export const releaseNoteService = new ReleaseNoteService()
