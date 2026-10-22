/**
 * A ruler's answer travels as one object, { measured_at, scores }, and is
 * stored as that object's JSON.
 *
 * A reopened report put the stored JSON string back on the ruler, and a ruler
 * nobody touched sent that string encoded once more. Every ruler then showed
 * empty, and each later save added another layer. Reading and sending through
 * here unwraps any number of layers, so the server always gets the object once.
 */

export interface ScaleAnswer {
    measured_at?: string
    scores: any[]
    [key: string]: any
}

// Each save of an untouched ruler added one layer. Bounded so a malformed
// value cannot loop.
const MAX_LAYERS = 10

/** The answer a ruler holds, or null when it holds none. */
export function scaleAnswerOf(value: any): ScaleAnswer | null {
    let current = value

    for (let i = 0; i < MAX_LAYERS && typeof current === 'string'; i++) {
        if (current === '') return null

        try {
            current = JSON.parse(current)
        } catch {
            return null
        }
    }

    if (!current || typeof current !== 'object' || Array.isArray(current)) return null

    return { ...current, scores: Array.isArray(current.scores) ? current.scores : [] }
}

/** What a fill-in sends for a ruler: its answer as JSON, encoded exactly once. */
export function scaleAnswerPayload(value: any): string {
    return JSON.stringify(scaleAnswerOf(value) ?? { scores: [] })
}
