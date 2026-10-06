import moment from 'moment'

/**
 * Task 339: protocol entries can be per hour as well as per day.
 *
 * An entry of a per-hour protocol carries `start_time`/`end_time` ("HH:MM");
 * one of a per-day protocol carries neither. These helpers keep the label and
 * the "has it started yet" rule the same on every screen that lists entries.
 */
export function protocolTimeLabel(entry: { start_time?: string | null, end_time?: string | null } | null | undefined): string {
    if (!entry?.start_time) return ''

    return entry.end_time ? `${entry.start_time}–${entry.end_time}` : entry.start_time
}

/**
 * When attendance for the entry can be recorded: from the start of its hour,
 * or from the start of its day for a per-day entry.
 */
export function protocolEntryStart(entry: { date?: string, start_time?: string | null } | null | undefined) {
    return moment(`${entry?.date ?? ''} ${entry?.start_time ?? '00:00'}`, 'YYYY-MM-DD HH:mm')
}

/** Date first, then hour, so a day's entries read in order. */
export function compareProtocolEntries(a: any, b: any): number {
    return `${a?.date ?? ''} ${a?.start_time ?? ''}`.localeCompare(`${b?.date ?? ''} ${b?.start_time ?? ''}`)
}
