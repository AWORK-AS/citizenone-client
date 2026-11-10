import { inject, provide } from 'vue'
import { meetingService, type MeetingService } from '@/components/api/user/MeetingService'

/**
 * Which meeting endpoints a meeting page talks to: the app's own, or the
 * superadmin panel's (a colleague holding a meeting as their host in our
 * account). The page provides it; the notes, tasks and minutes inside use it.
 */
const KEY = Symbol('meetingApi')

export function provideMeetingApi(api: MeetingService) {
    provide(KEY, api)
}

export function useMeetingApi(): MeetingService {
    return inject<MeetingService>(KEY, meetingService)
}
