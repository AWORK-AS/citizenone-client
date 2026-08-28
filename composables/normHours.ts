import moment from 'moment'

interface EmployeeNormHoursInput {
    annual_norm_hours?: number | string | null
    employee_detail?: {
        norm_period_id?: string | number | null
        date_of_employment?: string | null
        termination_date?: string | null
    } | null
    norm_period?: {
        period?: string | null // "DD.MM.YYYY - DD.MM.YYYY"
    } | null
}

function parsePeriodRange(period?: string | null) {
    if (!period) {
        return null
    }
    const [startStr, endStr] = period.split(' - ').map((part) => part?.trim())
    const start = moment(startStr, 'DD.MM.YYYY', true)
    const end = moment(endStr, 'DD.MM.YYYY', true)
    if (!start.isValid() || !end.isValid()) {
        return null
    }
    return { start, end }
}

/**
 * `annual_norm_hours` on duty-schedule employee stats is the backend's balance-calculation
 * figure for the currently viewed year (ScheduleService::findWeeklySchedules /
 * findMonthlySchedules -> EmployeeDetail::getNormPeriodProration()) — it is only a true
 * 52-week annual total for an employee on the default calendar-year norm period who was
 * employed the whole year. It comes out lower than that whenever the employee has a
 * custom (non-calendar-year) norm period, or their hire/termination date clamps the
 * measured range within the viewed year — and dividing that smaller figure by a flat 52
 * understates their real weekly hours (AW-2026-4263: "22 timer" shown for an employee who
 * actually works ~37h/week).
 *
 * For the common case this still divides by 52 (provably correct there). For the prorated
 * cases it divides by the actual measured range instead — the employee's real norm-period
 * cycle (from `norm_period.period`, already returned alongside `annual_norm_hours`),
 * clamped to their employment dates — rather than guessing a fixed 52.
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

    const periodRange = parsePeriodRange(employee?.norm_period?.period)
    let rangeStart = periodRange?.start ?? yearStart
    let rangeEnd = periodRange?.end ?? yearEnd
    if (hireDate?.isAfter(rangeStart)) {
        rangeStart = hireDate
    }
    if (terminationDate?.isBefore(rangeEnd)) {
        rangeEnd = terminationDate
    }

    const weeksInRange = (rangeEnd.diff(rangeStart, 'days') + 1) / 7
    if (!weeksInRange || weeksInRange <= 0) {
        return Math.round(annualNormHours / 52)
    }

    return Math.round(annualNormHours / weeksInRange)
}
