// Roadmap #317: which days the Give medicine calendar marks, and how.
// components/modules/user/citizen/medicine/modal-give-medicine.vue feeds it
// the medicine as its month request (the give-medicine range endpoint) returns
// it for the shown month. That response carries occurs_dates; if it ever
// doesn't (null or missing), every day within the start/end bounds counts as
// due, as before.
//
// "Due" follows the same gate the medicine tab uses for its day rows
// (isMedicineActiveOnDate in pages/citizens/[uuid]/medicine-journals.vue):
// - occurs_dates, when the API sends a list, names the days the schedule
//   falls on (frequency, custom dates and extra dates). When it is null or
//   missing every day counts, as before.
// - Never before the start date (or the creation day when there is no start
//   date), never after the repeat end date (or the end date when there is no
//   repeat end date), and only inside the filled-in treatment periods unless
//   the day is one of the medicine's extra dates.
//
// Kept dependency-free (no vue / Nuxt / moment) so tests/unit/*.test.mjs can
// import this .ts file directly under `node --test`.

export interface CalendarMedicine {
    occurs_dates?: string[] | null
    start_date?: string | null
    end_date?: string | null
    recurring_until?: string | null
    created_at?: string | null
    treatment_periods?: { start?: string | null, end?: string | null }[] | null
    extra_dates?: string[] | null
}

export type DayMarker = 'given' | 'overdue' | 'scheduled' | null

export interface DoseEntry {
    time?: string | null
    status?: string | null
}

export interface DayMarkerInput {
    /** The calendar day, YYYY-MM-DD. */
    dateStr: string
    /** Today, YYYY-MM-DD. */
    today: string
    /** The time now, HH:mm. */
    nowTime: string
    /** isDueOnDate() for this day. */
    due: boolean
    /** dosage_status_by_date[dateStr]: one entry per dose slot (plus extra logged doses). */
    entries?: DoseEntry[] | null
    /** The schedule's dose times (max_dosage_per_time), used when the day has no entries. */
    doseTimes?: string[] | null
}

/** The local calendar day (YYYY-MM-DD) of an API timestamp, or null. */
function localDay(timestamp: string | null | undefined): string | null {
    if (!timestamp) return null
    if (/^\d{4}-\d{2}-\d{2}$/.test(timestamp)) return timestamp
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return null
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** "08:00" or "08:00:00" as minutes after midnight, or null. */
function minutesOf(time: string | null | undefined): number | null {
    const match = /^(\d{1,2}):(\d{2})/.exec(time ?? '')
    return match ? Number(match[1]) * 60 + Number(match[2]) : null
}

export function medicineCalendarDays() {
    /** Whether the medicine was (or will be) due on this day. */
    function isDueOnDate(medicine: CalendarMedicine | null | undefined, dateStr: string): boolean {
        if (!medicine) return false

        if (Array.isArray(medicine.occurs_dates) && !medicine.occurs_dates.includes(dateStr)) return false

        const startDay = medicine.start_date || localDay(medicine.created_at)
        if (startDay && dateStr < startDay) return false

        const endDay = medicine.recurring_until || medicine.end_date
        if (endDay && dateStr > endDay) return false

        const periods = (Array.isArray(medicine.treatment_periods) ? medicine.treatment_periods : [])
            .filter((p) => p?.start && p?.end)
        if (periods.length > 0) {
            const inPeriod = periods.some((p) => dateStr >= (p.start as string) && dateStr <= (p.end as string))
            const isExtraDate = Array.isArray(medicine.extra_dates) && medicine.extra_dates.includes(dateStr)
            if (!inPeriod && !isExtraDate) return false
        }

        return true
    }

    /** The dot a calendar day shows: given (green), overdue (red), scheduled (amber) or none. */
    function dayMarker(input: DayMarkerInput): DayMarker {
        const entries = Array.isArray(input.entries) ? input.entries : []
        const isLogged = (entry: DoseEntry) => entry?.status === 'given' || entry?.status === 'delivered'

        // A dose logged on a day the medicine wasn't due is still a record.
        if (!input.due) return entries.some(isLogged) ? 'given' : null
        if (entries.length > 0 && entries.every(isLogged)) return 'given'
        if (input.dateStr < input.today) return 'overdue'
        if (input.dateStr > input.today) return 'scheduled'

        // Today: red once a dose time has passed without a log, or when a
        // dose was logged as deviated.
        if (entries.some((entry) => entry?.status === 'deviated')) return 'overdue'
        const now = minutesOf(input.nowTime)
        const openTimes = entries.length > 0
            ? entries.filter((entry) => !isLogged(entry)).map((entry) => entry?.time)
            : (Array.isArray(input.doseTimes) ? input.doseTimes : [])
        const anyPassed = openTimes.some((time) => {
            const minutes = minutesOf(time)
            return minutes !== null && now !== null && now > minutes
        })
        return anyPassed ? 'overdue' : 'scheduled'
    }

    return { isDueOnDate, dayMarker }
}
