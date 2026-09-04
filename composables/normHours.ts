import moment from 'moment'

interface EmployeeNormHoursInput {
    annual_norm_hours?: number | string | null
    employee_detail?: {
        norm_period_id?: string | number | null
        date_of_employment?: string | null
        termination_date?: string | null
    } | null
    norm_period?: {
        period_start?: string | null // "YYYY-MM-DD"
        period_end?: string | null // "YYYY-MM-DD"
        period?: string | null // "DD.MM.YYYY - DD.MM.YYYY" display label, fallback only
    } | null
}

/**
 * Weekdays (Mon-Fri) in an inclusive range, matching
 * EmployeeDetail::countWeekdaysBetween() -- both endpoints counted, 0 for an
 * inverted range. Done arithmetically rather than by walking days, so a bad
 * date from the API can't turn into a long loop.
 */
function countWeekdaysBetween(start: moment.Moment, end: moment.Moment): number {
    if (start.isAfter(end, 'day')) {
        return 0
    }

    const totalDays = end.diff(start, 'days') + 1
    let weekdays = Math.floor(totalDays / 7) * 5

    const startDayOfWeek = start.day()
    for (let offset = 0; offset < totalDays % 7; offset++) {
        const dayOfWeek = (startDayOfWeek + offset) % 7
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            weekdays++
        }
    }

    return weekdays
}

/**
 * The norm-period cycle the backend measured against. `period_start`/`period_end`
 * are ISO and always present (ScheduleService::findWeeklySchedules /
 * findMonthlySchedules / getUserHoursStats, DraftScheduleService); `period` is the
 * localised display label and is only parsed if they somehow aren't.
 */
function resolveNormPeriodRange(normPeriod: EmployeeNormHoursInput['norm_period']) {
    const isoStart = moment(normPeriod?.period_start ?? '', 'YYYY-MM-DD', true)
    const isoEnd = moment(normPeriod?.period_end ?? '', 'YYYY-MM-DD', true)
    if (isoStart.isValid() && isoEnd.isValid()) {
        return { start: isoStart, end: isoEnd }
    }

    const [startStr, endStr] = (normPeriod?.period ?? '').split(' - ').map((part) => part?.trim())
    const start = moment(startStr, 'DD.MM.YYYY', true)
    const end = moment(endStr, 'DD.MM.YYYY', true)
    if (start.isValid() && end.isValid()) {
        return { start, end }
    }

    return null
}

/**
 * `annual_norm_hours` on duty-schedule employee stats is the backend's balance-calculation
 * figure for the currently viewed year (ScheduleService::findWeeklySchedules /
 * findMonthlySchedules -> EmployeeDetail::normHoursWithMeasuredRange()) — it is only a true
 * 52-week annual total for an employee on the default calendar-year norm period who was
 * employed the whole year. It comes out lower than that whenever the employee has a
 * custom (non-calendar-year) norm period, or their hire/termination date clamps the
 * measured range within the viewed year — and dividing that smaller figure by a flat 52
 * understates their real weekly hours (AW-2026-4263: "22 timer" shown for an employee who
 * actually works ~37h/week — hired 01.06, so 1924 * 154/261 = 1135.23, and 1135.23/52 = 22).
 *
 * getNormPeriodProration() prorates on a **weekday** basis:
 *
 *     annual_norm_hours = true annual * (weekdays in measured range / weekdays in norm period)
 *
 * so the weekly figure it implies is simply `annual_norm_hours / (weekdays in range / 5)` —
 * the same basis and the same clamping the backend used, not an approximation of it. The
 * measured range is the norm-period cycle (`norm_period.period_start`/`period_end`, already
 * returned alongside `annual_norm_hours`) clamped to
 * `employee_detail.date_of_employment`/`termination_date`, exactly as the backend clamps it.
 *
 * The common case still divides by a flat 52 rather than by the year's 52.2 weekdays-weeks.
 * That is deliberate: it is what this panel has always shown for an unaffected employee, and
 * keeping it guarantees this fix cannot shift anyone who was never miscounted.
 */
export function calculateWeeklyNormHours(employee: EmployeeNormHoursInput | null | undefined, viewYear: number): number {
    const annualNormHours = Number(employee?.annual_norm_hours)
    if (!annualNormHours) {
        return 0
    }

    const detail = employee?.employee_detail
    const hireDate = detail?.date_of_employment ? moment(detail.date_of_employment) : null
    const terminationDate = detail?.termination_date ? moment(detail.termination_date) : null

    const yearStart = moment(`${viewYear}-01-01`)
    const yearEnd = moment(`${viewYear}-12-31`)
    const isClampedByEmployment = !!(hireDate?.isAfter(yearStart) || terminationDate?.isBefore(yearEnd))
    const hasCustomNormPeriod = !!detail?.norm_period_id

    if (!hasCustomNormPeriod && !isClampedByEmployment) {
        return Math.round(annualNormHours / 52)
    }

    const periodRange = resolveNormPeriodRange(employee?.norm_period)
    let rangeStart = periodRange?.start ?? yearStart
    let rangeEnd = periodRange?.end ?? yearEnd
    if (hireDate?.isAfter(rangeStart)) {
        rangeStart = hireDate
    }
    if (terminationDate?.isBefore(rangeEnd)) {
        rangeEnd = terminationDate
    }

    const weeksInRange = countWeekdaysBetween(rangeStart, rangeEnd) / 5
    if (!weeksInRange || weeksInRange <= 0) {
        return Math.round(annualNormHours / 52)
    }

    return Math.round(annualNormHours / weeksInRange)
}
