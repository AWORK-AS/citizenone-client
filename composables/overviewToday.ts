/**
 * "Today" counts for the overview. The page fetches whatever range the date
 * navigator holds (a week by default), so a number labelled "today" has to be
 * narrowed to the day here rather than taken from the length of the response.
 */

function parseLocal(value: unknown): Date | null {
    if (typeof value !== 'string' || value === '') return null
    const iso = value.includes('T') ? value : value.replace(' ', 'T')
    const date = new Date(iso)

    return Number.isNaN(date.getTime()) ? null : date
}

/** Events that take place on `day` at any point: started by its end, not ended before its start. */
export function countEventsOnDay(events: unknown, day: Date = new Date()): number {
    if (!Array.isArray(events)) return 0

    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0)
    const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999)

    return events.filter((event: any) => {
        const start = parseLocal(event?.date_time_start)
        if (!start) return false
        const end = parseLocal(event?.date_time_end) ?? start

        return start <= dayEnd && end >= dayStart
    }).length
}
