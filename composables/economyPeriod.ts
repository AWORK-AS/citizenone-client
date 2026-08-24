/**
 * The period shortcuts used by the economy screens. A month is what a placement
 * is agreed and invoiced in, so the screens open on one rather than on two empty
 * date fields.
 */
export function useEconomyPeriod() {
    function toDateString(date: Date): string {
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        return `${date.getFullYear()}-${month}-${day}`
    }

    function presetRange(key: string): { from: string; to: string } {
        const now = new Date()

        if (key === 'lastMonth') {
            return {
                from: toDateString(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
                to: toDateString(new Date(now.getFullYear(), now.getMonth(), 0)),
            }
        }

        if (key === 'thisYear') {
            return {
                from: toDateString(new Date(now.getFullYear(), 0, 1)),
                to: toDateString(new Date(now.getFullYear(), 11, 31)),
            }
        }

        return {
            from: toDateString(new Date(now.getFullYear(), now.getMonth(), 1)),
            to: toDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
        }
    }

    /** Which shortcut a pair of dates is, if it is one at all. */
    function matchPreset(from: string, to: string): string {
        const keys = ['thisMonth', 'lastMonth', 'thisYear']

        return keys.find((key) => {
            const range = presetRange(key)

            return range.from === from && range.to === to
        }) ?? ''
    }

    return { toDateString, presetRange, matchPreset }
}
