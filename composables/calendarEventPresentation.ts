/**
 * Small pure helpers behind how a calendar event looks and how it is copied.
 *
 * Kept free of Vue, moment and auto-imports so they can be unit tested with
 * `node --test tests/unit/calendarEventPresentation.test.mjs`.
 */

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * The colour of the event's first tag, if it has one and it is a hex colour.
 * Customers pick a colour per tag (medicine, doctor, activity); showing it on
 * the event lets them scan a week by colour instead of reading every title.
 */
export function eventTagColor(event: any): string | null {
    const color = event?.calendar_tags?.[0]?.color
    return typeof color === 'string' && HEX.test(color.trim()) ? color.trim() : null
}

/** The same colour at low opacity, for a tinted background. */
export function tintColor(hex: string, alpha = 0.12): string {
    let value = hex.replace('#', '')
    if (value.length === 3) value = value.split('').map(c => c + c).join('')
    const r = parseInt(value.slice(0, 2), 16)
    const g = parseInt(value.slice(2, 4), 16)
    const b = parseInt(value.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const CITIZEN = 'App\\Models\\Citizen'
const USER = 'App\\Models\\User'

function uuidsOf(rows: any[] | undefined, typeKey: string, modelKey: string, type: string): string[] {
    return (rows ?? [])
        .filter((row: any) => row?.[typeKey] === type)
        .map((row: any) => row?.[modelKey]?.uuid)
        .filter((uuid: any): uuid is string => typeof uuid === 'string' && uuid !== '')
}

export interface DuplicateFields {
    type: 'my_self' | 'employees' | 'citizens'
    title: string
    description: string
    unit_uuid: string
    is_private: boolean
    is_online_meeting: boolean
    meeting_url: string
    calendar_tag_uuid: string[]
    ownerCitizens: string[]
    ownerUsers: string[]
    inviteeCitizens: string[]
    inviteeUsers: string[]
    durationMinutes: number
}

/**
 * What "Duplicate" carries over into a new event: everything but the date,
 * the series and the journal link. Recurrence is left off on purpose - a copy
 * of one occurrence is one event.
 */
export function duplicateFields(event: any): DuplicateFields {
    const start = Date.parse(String(event?.date_time_start ?? '').replace(' ', 'T'))
    const end = Date.parse(String(event?.date_time_end ?? '').replace(' ', 'T'))
    const duration = Number.isFinite(start) && Number.isFinite(end) && end > start
        ? Math.round((end - start) / 60000)
        : 60

    const type = event?.type === 'citizens' || event?.type === 'employees' ? event.type : 'my_self'

    return {
        type,
        title: event?.title ?? '',
        description: event?.description ?? '',
        unit_uuid: event?.unit?.uuid ?? '',
        is_private: !!event?.is_private,
        is_online_meeting: !!event?.is_online_meeting,
        meeting_url: event?.meeting_url ?? '',
        calendar_tag_uuid: (event?.calendar_tags ?? []).map((tag: any) => tag?.uuid).filter(Boolean),
        ownerCitizens: uuidsOf(event?.calendar_owners, 'owner_type', 'owner', CITIZEN),
        ownerUsers: uuidsOf(event?.calendar_owners, 'owner_type', 'owner', USER),
        inviteeCitizens: uuidsOf(event?.calendar_users, 'user_type', 'user', CITIZEN),
        inviteeUsers: uuidsOf(event?.calendar_users, 'user_type', 'user', USER),
        durationMinutes: duration,
    }
}
