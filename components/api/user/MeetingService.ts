import BaseAPIService from '@/components/api/BaseAPIService'

/**
 * CitizenOne Online Meetings, staff side. Host-only actions (update, cancel,
 * admit, record) are refused by the API for everyone else.
 */
class MeetingService extends BaseAPIService {
    async list(params: { scope?: 'upcoming' | 'past' | 'all', page?: number }): Promise<any> {
        return await this.request('/user/meetings', 'GET', params)
    }

    async create(payload: object): Promise<any> {
        return await this.request('/user/meetings', 'POST', payload)
    }

    async get(uuid: string): Promise<any> {
        return await this.request(`/user/meetings/${uuid}`, 'GET')
    }

    async update(uuid: string, payload: object): Promise<any> {
        return await this.request(`/user/meetings/${uuid}`, 'PUT', payload)
    }

    async cancel(uuid: string): Promise<any> {
        return await this.request(`/user/meetings/${uuid}`, 'DELETE')
    }

    async finish(uuid: string): Promise<any> {
        return await this.request(`/user/meetings/${uuid}/finish`, 'POST')
    }

    async join(uuid: string, consentRecording = false): Promise<any> {
        return await this.request(`/user/meetings/${uuid}/join`, 'POST', { consent_recording: consentRecording })
    }

    async consent(uuid: string): Promise<any> {
        return await this.request(`/user/meetings/${uuid}/consent`, 'POST')
    }

    async addParticipants(uuid: string, participants: object[], sendInvites = true): Promise<any> {
        return await this.request(`/user/meetings/${uuid}/participants`, 'POST', { participants, send_invites: sendInvites })
    }

    async removeParticipant(uuid: string, participantUuid: string): Promise<any> {
        return await this.request(`/user/meetings/${uuid}/participants/${participantUuid}`, 'DELETE')
    }

    async resendInvite(uuid: string, participantUuid: string): Promise<any> {
        return await this.request(`/user/meetings/${uuid}/participants/${participantUuid}/resend`, 'POST')
    }

    async admit(uuid: string, participantUuid: string): Promise<any> {
        return await this.request(`/user/meetings/${uuid}/participants/${participantUuid}/admit`, 'POST')
    }

    async deny(uuid: string, participantUuid: string): Promise<any> {
        return await this.request(`/user/meetings/${uuid}/participants/${participantUuid}/deny`, 'POST')
    }

    async startRecording(uuid: string): Promise<any> {
        return await this.request(`/user/meetings/${uuid}/recordings/start`, 'POST')
    }

    async stopRecording(uuid: string): Promise<any> {
        return await this.request(`/user/meetings/${uuid}/recordings/stop`, 'POST')
    }

    async recordings(uuid: string): Promise<any> {
        return await this.request(`/user/meetings/${uuid}/recordings`, 'GET')
    }

    async recordingUrl(recordingUuid: string): Promise<any> {
        return await this.request(`/user/meetings/recordings/${recordingUuid}/url`, 'GET')
    }

    async deleteRecording(recordingUuid: string): Promise<any> {
        return await this.request(`/user/meetings/recordings/${recordingUuid}`, 'DELETE')
    }

    async requestSummary(recordingUuid: string): Promise<any> {
        return await this.request(`/user/meetings/recordings/${recordingUuid}/summary`, 'POST')
    }

    async citizenRecordings(citizenUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/meeting-recordings`, 'GET')
    }

    async createFromCalendar(calendarUuid: string): Promise<any> {
        return await this.request(`/user/meetings/from-calendar/${calendarUuid}`, 'POST')
    }

    async startNow(payload: { user_uuid?: string, citizen_uuid?: string } = {}): Promise<any> {
        return await this.request('/user/meetings/start-now', 'POST', payload)
    }

    async updateNotes(uuid: string, notes: string, seenUpdatedAt: string | null): Promise<any> {
        return await this.request(`/user/meetings/${uuid}/notes`, 'PUT', { notes, seen_updated_at: seenUpdatedAt })
    }

    async notesToJournal(uuid: string, summary?: string): Promise<any> {
        return await this.request(`/user/meetings/${uuid}/notes/journal`, 'POST', summary ? { summary } : {})
    }

    async summarizeNotes(uuid: string): Promise<any> {
        return await this.request(`/user/meetings/${uuid}/notes/summary`, 'POST')
    }

    async settings(): Promise<any> {
        return await this.request('/user/meetings/settings', 'GET')
    }

    async updateSettings(payload: object): Promise<any> {
        return await this.request('/user/meetings/settings', 'PUT', payload)
    }

    async statistics(params: { from?: string, to?: string }): Promise<any> {
        return await this.request('/user/meetings/statistics', 'GET', params)
    }
}

export const meetingService = new MeetingService()
