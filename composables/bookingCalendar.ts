/**
 * The month grid behind the patient's booking calendar. Pure, so it is tested
 * without rendering, and kept the same as the app's
 * `components/portal/bookingCalendarGrid.ts`.
 *
 * Dates are the API's `YYYY-MM-DD` strings throughout and are never turned into
 * a `Date` at midnight UTC, which east of Greenwich is the day before.
 * Weeks start on Monday, as they do in Denmark, Norway and Sweden.
 */
export interface CalendarDay {
    key: string
    day: number
    inMonth: boolean
    available: boolean
}

export interface CalendarMonth {
    year: number
    /** 0-11, as `Date` counts them. */
    month: number
}

const pad = (value: number) => String(value).padStart(2, '0')

export const dayKey = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`

export const monthOf = (key: string): CalendarMonth => {
    const [year, month] = key.split('-').map(Number)
    return { year, month: month - 1 }
}

const monthIndex = ({ year, month }: CalendarMonth) => year * 12 + month

const fromIndex = (index: number): CalendarMonth => ({ year: Math.floor(index / 12), month: index % 12 })

/** Every month from the first to the last bookable date, so the arrows never land on an empty stretch outside them. */
export const bookableMonths = (dates: string[]): CalendarMonth[] => {
    if (dates.length === 0) return []
    const indexes = dates.map((key) => monthIndex(monthOf(key)))
    const first = Math.min(...indexes)
    const last = Math.max(...indexes)
    return Array.from({ length: last - first + 1 }, (_, i) => fromIndex(first + i))
}

/** The weeks of one month, Monday first, padded with the neighbouring months' days. */
export const monthGrid = ({ year, month }: CalendarMonth, available: Set<string>): CalendarDay[][] => {
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7

    const days: CalendarDay[] = Array.from({ length: cells }, (_, i) => {
        const date = new Date(year, month, 1 - firstWeekday + i)
        const key = dayKey(date.getFullYear(), date.getMonth(), date.getDate())
        const inMonth = date.getMonth() === month
        return { key, day: date.getDate(), inMonth, available: inMonth && available.has(key) }
    })

    return Array.from({ length: cells / 7 }, (_, week) => days.slice(week * 7, week * 7 + 7))
}
