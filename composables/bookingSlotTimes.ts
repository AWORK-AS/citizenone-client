/**
 * The times of one bookable day, cut from a window: 08:00-12:00 in 20-minute
 * appointments with a 5-minute gap is 08:00, 08:25, 08:50 and so on, up to the
 * last one that still ends inside the window.
 *
 * A clinic thinks in "mornings, 20 minutes each", not in rows. Kept free of
 * moment and of Vue so the services screen and its tests agree on the cut.
 */
export interface SlotTime {
    start_time: string
    end_time: string
    capacity: number
}

/** The backend refuses more rows than this in one request. */
export const MAX_SLOT_TIMES_PER_DAY = 96

function toMinutes(time: string): number | null {
    const match = /^(\d{1,2}):(\d{2})$/.exec(`${time ?? ''}`.trim())

    if (!match) {
        return null
    }

    const hours = Number(match[1])
    const minutes = Number(match[2])

    if (hours > 23 || minutes > 59) {
        return null
    }

    return hours * 60 + minutes
}

function toTime(total: number): string {
    const hours = `${Math.floor(total / 60)}`.padStart(2, '0')
    const minutes = `${total % 60}`.padStart(2, '0')

    return `${hours}:${minutes}`
}

export function bookingSlotTimes(
    from: string,
    to: string,
    lengthMinutes: number,
    gapMinutes = 0,
    capacity = 1,
): SlotTime[] {
    const start = toMinutes(from)
    const end = toMinutes(to)
    const length = Math.trunc(Number(lengthMinutes))
    const gap = Math.max(0, Math.trunc(Number(gapMinutes) || 0))
    const seats = Math.max(1, Math.trunc(Number(capacity) || 1))

    if (start === null || end === null || !(length > 0) || end <= start) {
        return []
    }

    const times: SlotTime[] = []

    for (let at = start; at + length <= end && times.length < MAX_SLOT_TIMES_PER_DAY; at += length + gap) {
        times.push({ start_time: toTime(at), end_time: toTime(at + length), capacity: seats })
    }

    return times
}
