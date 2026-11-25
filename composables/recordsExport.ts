/**
 * Roadmap #396: exporting use of force and incidents to xlsx/csv. The pure
 * parts of the export window, kept apart so they can be tested without Nuxt.
 */
import moment from 'moment'

export type RecordsKind = 'useOfForce' | 'incidents'
export type RecordsFormat = 'xlsx' | 'csv'

// Must match CitizenRecordsExportRequest::MAX_YEARS on the server.
export const MAX_YEARS = 5
const DATE = 'YYYY-MM-DD'

/**
 * The period the window opens with: the statistics page's own range when it
 * has one, otherwise the last twelve months up to today.
 */
export function defaultPeriod(range?: { start_date?: string, end_date?: string } | null, today: string = moment().format(DATE)) {
    const from = range?.start_date && moment(range.start_date, DATE, true).isValid() ? range.start_date : moment(today, DATE).subtract(1, 'year').add(1, 'day').format(DATE)
    const to = range?.end_date && moment(range.end_date, DATE, true).isValid() ? range.end_date : today
    return { from, to }
}

/** '' when the period can be exported, else the key of the reason it cannot. */
export function periodProblem(from: string, to: string): '' | 'missing' | 'order' | 'tooLong' {
    if (!from || !to) return 'missing'
    const start = moment(from, DATE, true)
    const end = moment(to, DATE, true)
    if (!start.isValid() || !end.isValid()) return 'missing'
    if (end.isBefore(start)) return 'order'
    if (start.clone().add(MAX_YEARS, 'years').isBefore(end)) return 'tooLong'
    return ''
}

/**
 * The query the server reads. A citizen's export never sends a department:
 * that filter belongs to the company-wide one.
 */
export function exportParams(input: {
    kind: RecordsKind, format: RecordsFormat, from: string, to: string,
    citizenUuid?: string | null, departmentUuid?: string | null, includeDrafts?: boolean,
}): Record<string, string | number> {
    const params: Record<string, string | number> = { format: input.format, from: input.from, to: input.to }
    if (input.citizenUuid) {
        params.citizen_uuid = input.citizenUuid
    } else if (input.departmentUuid) {
        params.department_uuid = input.departmentUuid
    }
    if (input.kind === 'incidents' && input.includeDrafts) params.include_drafts = 1
    return params
}

/** The file name from Content-Disposition (filename* first), or a fallback. */
export function filenameFrom(disposition: string | null | undefined, fallback: string): string {
    const value = disposition || ''
    const encoded = value.match(/filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/i)
    if (encoded?.[1]) {
        try {
            return decodeURIComponent(encoded[1].trim().replace(/^"|"$/g, ''))
        } catch {
            // Fall through to the plain filename.
        }
    }
    const plain = value.match(/filename\s*=\s*"([^"]+)"/i) || value.match(/filename\s*=\s*([^;]+)/i)
    return plain?.[1]?.trim() || fallback
}
