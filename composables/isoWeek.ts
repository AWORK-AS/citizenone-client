import moment from 'moment'

/**
 * The ISO week number (Danish standard): weeks start on Monday and week 1 is
 * the week with the year's first Thursday, so 1 January can still belong to
 * week 52 or 53 of the year before. Roadmap #303.
 *
 * Free of Vue so it can be tested with `node --test tests/unit/isoWeek.test.mjs`.
 */
export function isoWeekOf(date: string | Date | moment.Moment): number {
    return moment(date).isoWeek()
}
