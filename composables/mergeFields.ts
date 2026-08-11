/**
 * Merge fields are resolved when a report is filled in and the resolved text is
 * what gets stored. A report is a document about a period: reopening it in two
 * years must show the address the family had then, not the one they have now.
 */
export function useMergeFields() {
    const PATTERN = /\{\{\s*([a-z0-9_.]+)\s*\}\}/gi

    function applyMergeFields(text: string, values: Record<string, string> | null): string {
        if (!text || !values) return text ?? ''

        return text.replace(PATTERN, (whole, key) => {
            const resolved = values[String(key).toLowerCase()]

            // An unknown key is left as written. A typo that quietly became
            // blank would be invisible in a report to a municipality.
            return resolved === undefined ? whole : resolved
        })
    }

    /** Whether a piece of text carries any field at all. */
    function hasMergeFields(text: string): boolean {
        return !!text && new RegExp(PATTERN.source, 'i').test(text)
    }

    return { applyMergeFields, hasMergeFields }
}
