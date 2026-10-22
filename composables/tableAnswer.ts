/**
 * A table's answer travels as its rows, a list of lists of cells, and is stored
 * as that list's JSON.
 *
 * A reopened report put the stored JSON string back on the table, and a table
 * nobody touched sent that string encoded once more. The table then read a
 * string instead of rows and showed the template's own rows, so a filled table
 * lost its content, and each later save added another layer. Reading and
 * sending through here unwraps any number of layers, so the server always gets
 * the rows once.
 */

// Each save of an untouched table added one layer. Bounded so a malformed
// value cannot loop.
const MAX_LAYERS = 10

/** The rows a table holds, or null when it holds none (then it shows the template's). */
export function tableAnswerOf(value: any): any[][] | null {
    let current = value

    for (let i = 0; i < MAX_LAYERS && typeof current === 'string'; i++) {
        if (current === '') return null

        try {
            current = JSON.parse(current)
        } catch {
            return null
        }
    }

    return Array.isArray(current) ? current : null
}

/**
 * What a fill-in sends for a table: its rows as JSON, encoded exactly once. A
 * table that holds none sends what an untouched table on a new report always
 * sent: the empty answer encoded once (""), or [] when it had no answer at all.
 */
export function tableAnswerPayload(value: any): string {
    if (value === null || value === undefined) return '[]'

    const rows = tableAnswerOf(value)

    return JSON.stringify(rows ?? '')
}
