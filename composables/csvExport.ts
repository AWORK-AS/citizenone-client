/**
 * CSV for the superadmin lists, written for Danish Excel: semicolons between
 * fields (a comma is the decimal mark here), a UTF-8 BOM so æøå survive the
 * double-click, CRLF line ends, and numbers and dates the way Excel in Danish
 * reads them back as numbers and dates.
 */

export type CsvType = 'text' | 'number' | 'amount' | 'date' | 'datetime'

export interface CsvColumn {
    label: string
    /** The cell, from the row. */
    value: (row: any) => unknown
    type?: CsvType
}

export const CSV_SEPARATOR = ';'
export const CSV_BOM = '﻿'
export const CSV_EOL = '\r\n'
/** About what anybody opens in Excel before it should have been a report. */
export const CSV_MAX_ROWS = 5000

const pad = (value: number) => String(value).padStart(2, '0')

/** A number with a decimal comma and no thousands separator, which Excel reads back as a number. */
export function csvNumber(value: unknown, decimals: number | null = null): string {
    if (value === null || value === undefined || value === '') return ''
    const number = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
    if (!Number.isFinite(number)) return String(value)
    const text = decimals === null ? String(number) : number.toFixed(decimals)
    return text.replace('.', ',')
}

/**
 * 'YYYY-MM-DD' is a day and stays that day; anything else is a moment and is
 * shown in local time, like the table next to the button.
 */
function toDate(value: unknown): Date | null {
    if (value === null || value === undefined || value === '') return null
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
    const text = String(value)
    const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
    if (day) return new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]))
    const date = new Date(text)
    return Number.isNaN(date.getTime()) ? null : date
}

/** dd-mm-åååå */
export function csvDate(value: unknown): string {
    const date = toDate(value)
    if (!date) return value === null || value === undefined ? '' : String(value)
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`
}

/** dd-mm-åååå tt:mm */
export function csvDateTime(value: unknown): string {
    const date = toDate(value)
    if (!date) return value === null || value === undefined ? '' : String(value)
    return `${csvDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatCsvValue(value: unknown, type: CsvType = 'text'): string {
    if (value === null || value === undefined) return ''
    switch (type) {
        case 'number': return csvNumber(value)
        case 'amount': return csvNumber(value, 2)
        case 'date': return csvDate(value)
        case 'datetime': return csvDateTime(value)
        default: return Array.isArray(value) ? value.join(', ') : String(value)
    }
}

/**
 * One field, quoted when it has to be: a separator, a quote or a line break
 * inside it. A text that starts like a formula gets a leading apostrophe, so a
 * company called "=HYPERLINK(...)" stays a name in Excel.
 */
export function csvCell(value: string, type: CsvType = 'text'): string {
    let text = value ?? ''
    if (type === 'text' && /^[=+\-@\t\r]/.test(text) && text.length > 1) text = `'${text}`
    if (/[";\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
    return text
}

export function buildCsv(columns: CsvColumn[], rows: any[], options: { bom?: boolean } = {}): string {
    const lines = [columns.map(column => csvCell(column.label)).join(CSV_SEPARATOR)]
    for (const row of rows) {
        lines.push(columns.map((column) => {
            const type = column.type ?? 'text'
            let raw: unknown
            try {
                raw = column.value(row)
            } catch {
                raw = ''
            }
            return csvCell(formatCsvValue(raw, type), type)
        }).join(CSV_SEPARATOR))
    }
    return (options.bom === false ? '' : CSV_BOM) + lines.join(CSV_EOL) + CSV_EOL
}

/** `Virksomheder` on 8 Nov 2026 is `virksomheder-2026-11-08.csv`. */
export function csvFilename(base: string, date: Date = new Date()): string {
    const slug = (base || 'export')
        .toLowerCase()
        .replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
        .normalize('NFKD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'export'
    return `${slug}-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.csv`
}

export interface ExportPage {
    rows: any[]
    lastPage: number
    total: number
}

export interface CollectedRows {
    rows: any[]
    total: number
    /** More rows matched than the cap let through. */
    truncated: boolean
}

/**
 * Every page of a paginated list, asked for with the list's own params, one
 * page at a time, until the last page or the cap. `onProgress` gets the rows
 * so far and the total the server reported. An `aborted()` that turns true
 * stops after the page in flight.
 */
export async function collectPages(
    fetchPage: (page: number) => Promise<ExportPage>,
    options: { maxRows?: number; onProgress?: (done: number, total: number) => void; aborted?: () => boolean } = {},
): Promise<CollectedRows> {
    const maxRows = options.maxRows ?? CSV_MAX_ROWS
    const rows: any[] = []
    let total = 0
    let page = 1
    let lastPage = 1

    do {
        const result = await fetchPage(page)
        const pageRows = Array.isArray(result?.rows) ? result.rows : []
        lastPage = Math.max(1, Number(result?.lastPage) || 1)
        total = Math.max(Number(result?.total) || 0, rows.length + pageRows.length)
        rows.push(...pageRows)
        options.onProgress?.(Math.min(rows.length, maxRows), Math.min(total, maxRows))
        if (!pageRows.length || options.aborted?.()) break
        page++
    } while (page <= lastPage && rows.length < maxRows)

    return { rows: rows.slice(0, maxRows), total, truncated: total > maxRows || rows.length > maxRows }
}
