import BaseAPIService from '@/components/api/BaseAPIService'

/**
 * CitizenOne Online Meetings, staff side. Host-only actions (update, cancel,
 * admit, record) are refused by the API for everyone else.
 */
export class MeetingService extends BaseAPIService {
    /**
     * Where the meeting endpoints are: the app's own, or the superadmin
     * panel's, where a colleague holds a meeting as their host in our account.
     */
    constructor(public readonly base: string = '/user/meetings') {
        super()
    }

    async list(params: { scope?: 'upcoming' | 'past' | 'all', page?: number }): Promise<any> {
        return await this.request(`${this.base}`, 'GET', params)
    }

    async create(payload: object): Promise<any> {
        return await this.request(`${this.base}`, 'POST', payload)
    }

    async get(uuid: string): Promise<any> {
        return await this.request(`${this.base}/${uuid}`, 'GET')
    }

    async update(uuid: string, payload: object): Promise<any> {
        return await this.request(`${this.base}/${uuid}`, 'PUT', payload)
    }

    async cancel(uuid: string): Promise<any> {
        return await this.request(`${this.base}/${uuid}`, 'DELETE')
    }

    async finish(uuid: string): Promise<any> {
        return await this.request(`${this.base}/${uuid}/finish`, 'POST')
    }

    async join(uuid: string, consentRecording = false): Promise<any> {
        return await this.request(`${this.base}/${uuid}/join`, 'POST', { consent_recording: consentRecording })
    }

    async consent(uuid: string): Promise<any> {
        return await this.request(`${this.base}/${uuid}/consent`, 'POST')
    }

    async addParticipants(uuid: string, participants: object[], sendInvites = true): Promise<any> {
        return await this.request(`${this.base}/${uuid}/participants`, 'POST', { participants, send_invites: sendInvites })
    }

    async removeParticipant(uuid: string, participantUuid: string): Promise<any> {
        return await this.request(`${this.base}/${uuid}/participants/${participantUuid}`, 'DELETE')
    }

    async resendInvite(uuid: string, participantUuid: string): Promise<any> {
        return await this.request(`${this.base}/${uuid}/participants/${participantUuid}/resend`, 'POST')
    }

    async admit(uuid: string, participantUuid: string): Promise<any> {
        return await this.request(`${this.base}/${uuid}/participants/${participantUuid}/admit`, 'POST')
    }

    async deny(uuid: string, participantUuid: string): Promise<any> {
        return await this.request(`${this.base}/${uuid}/participants/${participantUuid}/deny`, 'POST')
    }

    async startRecording(uuid: string): Promise<any> {
        return await this.request(`${this.base}/${uuid}/recordings/start`, 'POST')
    }

    async stopRecording(uuid: string): Promise<any> {
        return await this.request(`${this.base}/${uuid}/recordings/stop`, 'POST')
    }

    async recordings(uuid: string): Promise<any> {
        return await this.request(`${this.base}/${uuid}/recordings`, 'GET')
    }

    // Every recording the user may see, for the Recordings tab.
    async allRecordings(page = 1): Promise<any> {
        return await this.request(`${this.base}/recordings`, 'GET', { page })
    }

    async recordingUrl(recordingUuid: string): Promise<any> {
        return await this.request(`${this.base}/recordings/${recordingUuid}/url`, 'GET')
    }

    async deleteRecording(recordingUuid: string): Promise<any> {
        return await this.request(`${this.base}/recordings/${recordingUuid}`, 'DELETE')
    }

    async requestSummary(recordingUuid: string): Promise<any> {
        return await this.request(`${this.base}/recordings/${recordingUuid}/summary`, 'POST')
    }

    async citizenRecordings(citizenUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/meeting-recordings`, 'GET')
    }

    async createFromCalendar(calendarUuid: string): Promise<any> {
        return await this.request(`${this.base}/from-calendar/${calendarUuid}`, 'POST')
    }

    /** "Mit mødelokale": the host's standing room with a fixed link, or null. */
    async personalRoom(): Promise<any> {
        return await this.request(`${this.base}/personal-room`, 'GET')
    }

    async openPersonalRoom(): Promise<any> {
        return await this.request(`${this.base}/personal-room`, 'POST')
    }

    /** A new link; the old one stops working at once. */
    async newPersonalRoomLink(): Promise<any> {
        return await this.request(`${this.base}/personal-room/new-link`, 'POST')
    }

    async startNow(payload: { user_uuid?: string, citizen_uuid?: string } = {}): Promise<any> {
        return await this.request(`${this.base}/start-now`, 'POST', payload)
    }

    async updateNotes(uuid: string, notes: string, seenUpdatedAt: string | null): Promise<any> {
        return await this.request(`${this.base}/${uuid}/notes`, 'PUT', { notes, seen_updated_at: seenUpdatedAt })
    }

    async notesToJournal(uuid: string, summary?: string): Promise<any> {
        return await this.request(`${this.base}/${uuid}/notes/journal`, 'POST', summary ? { summary } : {})
    }

    async summarizeNotes(uuid: string): Promise<any> {
        return await this.request(`${this.base}/${uuid}/notes/summary`, 'POST')
    }

    // Cody's brief before a meeting about a citizen, with a suggested agenda.
    async brief(uuid: string): Promise<any> {
        return await this.request(`${this.base}/${uuid}/brief`, 'POST')
    }

    // The agreements in a recording's summary, the summary on screen or the notes, as suggested tasks.
    async actionItems(uuid: string, source: { recording_uuid?: string, summary?: string } = {}): Promise<any> {
        return await this.request(`${this.base}/${uuid}/action-items`, 'POST', source)
    }

    async minutesPdf(uuid: string, source: { recording_uuid?: string, summary?: string } = {}, onHeaders?: (headers: Headers) => void): Promise<Blob | null> {
        return await this.requestBlob(`${this.base}/${uuid}/minutes`, 'POST', source, onHeaders)
    }

    async settings(): Promise<any> {
        return await this.request(`${this.base}/settings`, 'GET')
    }

    async updateSettings(payload: object): Promise<any> {
        return await this.request(`${this.base}/settings`, 'PUT', payload)
    }

    async statistics(params: { from?: string, to?: string }): Promise<any> {
        return await this.request(`${this.base}/statistics`, 'GET', params)
    }
}

export const meetingService = new MeetingService()

/** The same host actions from the superadmin panel (ActAsSalesHost in the API). */
export const staffHostMeetingService = new MeetingService('/superadmin/sales-meetings/host')
