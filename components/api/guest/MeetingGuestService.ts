import BaseAPIService from '@/components/api/BaseAPIService'

/**
 * A guest's side of an online meeting, by the personal link in their
 * invitation. No login: the token in the link is the only credential.
 */
class MeetingGuestService extends BaseAPIService {
    async show(token: string): Promise<any> {
        return await this.request(`/meetings/join/${token}`, 'GET')
    }

    async knock(token: string, consentRecording = false): Promise<any> {
        return await this.request(`/meetings/join/${token}/knock`, 'POST', { consent_recording: consentRecording })
    }

    async status(token: string): Promise<any> {
        return await this.request(`/meetings/join/${token}/status`, 'GET')
    }

    /** A host's personal room: who it belongs to, before giving a name. */
    async roomDoor(slug: string): Promise<any> {
        return await this.request(`/meetings/room/${encodeURIComponent(slug)}`, 'GET')
    }

    /** Gives a name at a personal room's door; answers with a guest token for /meet/{token}. */
    async enterRoom(slug: string, params: { name: string, email?: string | null }): Promise<any> {
        return await this.request(`/meetings/room/${encodeURIComponent(slug)}/enter`, 'POST', params)
    }

    async consent(token: string): Promise<any> {
        return await this.request(`/meetings/join/${token}/consent`, 'POST')
    }
}

export const meetingGuestService = new MeetingGuestService()
