import moment from 'moment'

/**
 * Roadmap #499: the units overview's grid, as plain functions so the layout
 * can be tested with `node --test tests/unit/unitOverview.test.mjs`.
 *
 * A booking from the API: { calendar_uuid, start, end, is_visible, title,
 * employee, citizen } with start/end as "YYYY-MM-DD HH:mm:ss".
 */

export type OverviewView = 'day' | 'week' | 'month'

export type UnitBooking = {
    calendar_uuid: string | null
    start: string
    end: string
    is_visible: boolean
    is_cancelled?: boolean
    title: string | null
    employee: string | null
    citizen: string | null
}

export type UnitRow = { unit: { uuid: string, name: string, color: string | null }, bookings: UnitBooking[] }

/** The day view's hours: a working day, so a 30-minute booking is still wide enough to read. */
export const DAY_START_HOUR = 6
export const DAY_END_HOUR = 22

const DAY = 'YYYY-MM-DD'

/** The dates a view shows around `date` (weeks start on Monday, ISO). */
export function periodFor(view: OverviewView, date: string): { from: string, to: string, days: string[] } {
    const base = moment(date, DAY)
    let start = base.clone()
    let end = base.clone()
    if (view === 'week') {
        start = base.clone().startOf('isoWeek')
        end = base.clone().endOf('isoWeek')
    } else if (view === 'month') {
        start = base.clone().startOf('month')
        end = base.clone().endOf('month')
    }
    const days: string[] = []
    for (const d = start.clone(); d.isSameOrBefore(end, 'day'); d.add(1, 'day')) days.push(d.format(DAY))
    return { from: start.format(DAY), to: end.format(DAY), days }
}

/** The date one step back (-1) or forward (+1) in the view. */
export function shiftDate(view: OverviewView, date: string, step: number): string {
    const unit = view === 'day' ? 'day' : view === 'week' ? 'week' : 'month'
    return moment(date, DAY).add(step, unit).format(DAY)
}

/** Bookings that touch `day` at all, earliest first: one that runs over midnight shows on both days. */
export function bookingsOnDay(bookings: UnitBooking[], day: string): UnitBooking[] {
    const dayStart = moment(day, DAY).startOf('day')
    const dayEnd = moment(day, DAY).endOf('day')
    return bookings
        .filter((b) => moment(b.start).isSameOrBefore(dayEnd) && moment(b.end).isSameOrAfter(dayStart))
        .sort((a, b) => a.start.localeCompare(b.start))
}

/**
 * Where a booking sits in the day view's hour axis, as percentages of the
 * width. Clamped to the axis, so an all-night booking fills it; never thinner
 * than 2%, so a short booking can still be seen and clicked.
 */
export function placeInDay(booking: UnitBooking, day: string, startHour = DAY_START_HOUR, endHour = DAY_END_HOUR): { left: number, width: number } | null {
    const axisStart = moment(day, DAY).hour(startHour).minute(0).second(0)
    const axisEnd = moment(day, DAY).hour(endHour).minute(0).second(0)
    const total = axisEnd.diff(axisStart, 'minutes')
    const start = moment.max(moment(booking.start), axisStart)
    const end = moment.min(moment(booking.end), axisEnd)
    if (!end.isAfter(start)) return null
    const left = (start.diff(axisStart, 'minutes') / total) * 100
    const width = Math.max((end.diff(start, 'minutes') / total) * 100, 2)
    return { left: round(left), width: round(Math.min(width, 100 - left)) }
}

/** The hours the day view's columns stand for. */
export function hourSlots(startHour = DAY_START_HOUR, endHour = DAY_END_HOUR): number[] {
    return Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
}

/** "10:00–12:00"; a booking that started the day before or ends the next day says so with "…". */
export function timeLabel(booking: UnitBooking, day: string): string {
    const start = moment(booking.start)
    const end = moment(booking.end)
    const from = start.isSame(day, 'day') ? start.format('HH:mm') : '…'
    const to = end.isSame(day, 'day') ? end.format('HH:mm') : '…'
    return `${from}–${to}`
}

/** What a booking says: its title for one the viewer may see, otherwise only "booked". */
export function bookingLabel(booking: UnitBooking, bookedText: string): string {
    return booking.is_visible ? (booking.title || bookedText) : bookedText
}

/** Hover text: who booked it and for whom, only for a booking the viewer may see. */
export function bookingDetails(booking: UnitBooking): string {
    if (!booking.is_visible) return ''
    return [booking.title, booking.employee, booking.citizen].filter(Boolean).join(' · ')
}

/**
 * The phone layout: per unit, the days in view that have bookings, in order.
 * A unit with none in the period has an empty list and shows as free.
 */
export function phoneList(rows: UnitRow[], days: string[]): { unit: UnitRow['unit'], days: { date: string, bookings: UnitBooking[] }[] }[] {
    return rows.map((row) => ({
        unit: row.unit,
        days: days
            .map((date) => ({ date, bookings: bookingsOnDay(row.bookings, date) }))
            .filter((d) => d.bookings.length > 0),
    }))
}

/** The "only free units" window as the API wants it. */
export function freeWindow(date: string, fromTime: string, toTime: string): { only_free_from: string, only_free_to: string } | null {
    if (!date || !fromTime || !toTime || toTime <= fromTime) return null
    return { only_free_from: `${date} ${fromTime}`, only_free_to: `${date} ${toTime}` }
}

/** Where a click in a free spot starts the new event: the hour clicked (day view), or 09:00 (week/month). */
export function newEventStart(day: string, hour?: number): string {
    return moment(day, DAY).hour(hour ?? 9).minute(0).format('YYYY-MM-DD HH:mm')
}

function round(value: number): number {
    return Math.round(value * 100) / 100
}
