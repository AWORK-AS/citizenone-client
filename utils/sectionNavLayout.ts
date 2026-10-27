export type SectionNavLayoutInput = {
    widths: number[]
    available: number
    moreWidth: number
    activeIndex: number
    gap: number
    max: number
}

/**
 * Which tabs of the citizen section row are shown inline; the rest go under "More".
 *
 * Everything shows when it fits and there are no more than `max` tabs. Otherwise the
 * active tab is always kept (the current section must never hide behind the
 * dropdown) and the row is filled from the left, leaving room for "More", up to
 * `max` tabs. At least one tab is always shown.
 */
export function pickVisibleTabs({ widths, available, moreWidth, activeIndex, gap, max }: SectionNavLayoutInput): number[] {
    const total = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(widths.length - 1, 0)
    if (total <= available && widths.length <= max) {
        return widths.map((_, index) => index)
    }

    const chosen = new Set<number>()
    let used = moreWidth

    if (activeIndex >= 0 && activeIndex < widths.length) {
        chosen.add(activeIndex)
        used += widths[activeIndex] + gap
    }
    for (let index = 0; index < widths.length; index++) {
        if (chosen.size >= max) break
        if (chosen.has(index)) continue
        if (used + widths[index] + gap > available) break
        chosen.add(index)
        used += widths[index] + gap
    }
    if (!chosen.size && widths.length) chosen.add(0)

    return [...chosen].sort((a, b) => a - b)
}
