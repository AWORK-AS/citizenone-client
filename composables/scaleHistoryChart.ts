/**
 * Which dates under the earlier-measurements chart get a label.
 *
 * At most `max`, always the first and the last, and never closer together than
 * `minGap` (a label's width plus a gap). Spread by rounding, two labels could
 * land on neighbouring dates and run into each other ("15/03/2615/04/26").
 * The report PDF uses the same rule (backend pdf/partials/scale-history.blade.php).
 *
 * @param count  how many dates the chart has, evenly spaced
 * @param innerWidth  the width the dates are spread over
 * @param minGap  the least distance between two labels' centres
 */
export function chartLabelIndices(count: number, innerWidth: number, minGap: number, max = 8): number[] {
    if (count <= 0) return []
    if (count === 1) return [0]

    const last = count - 1
    const spacing = innerWidth / last
    const step = Math.max(1, Math.ceil(minGap / spacing), Math.ceil(last / (max - 1)))
    const indices: number[] = []

    for (let i = 0; i <= last; i += step) indices.push(i)

    if (indices[indices.length - 1] !== last) {
        // The last date is always labelled; the one before it gives way when
        // it would sit too close.
        if (indices.length > 1 && last - indices[indices.length - 1] < step) indices.pop()
        indices.push(last)
    }

    return indices
}

/** A label's width plus a gap, for labels of `chars` characters at `fontSize`. */
export function chartLabelGap(chars: number, fontSize: number): number {
    return chars * fontSize * 0.6 + 6
}
