// What the citizen picker in "Ny note" shows. A dropdown of every citizen in
// alphabetical order stops working somewhere past a few dozen; with 100+ the
// one you want is found by typing, and the ones you use daily are on top.
// Pure, for tests/unit/citizenPicker.test.mjs.

export interface PickerOption {
    value: string
    label: string
    pinned?: boolean
    image?: string | null
}

export interface PickerSection {
    key: 'pinned' | 'recent' | 'all' | 'matches'
    options: PickerOption[]
}

/** "Anna Lindberg (demo)" -> "AL". Brackets and digits never become initials. */
export function initials(label: string): string {
    const words = String(label ?? '').replace(/\(.*?\)/g, ' ').split(/\s+/).filter(w => /^\p{L}/u.test(w))
    if (!words.length) return '?'
    const first = words[0][0]
    const last = words.length > 1 ? words[words.length - 1][0] : ''
    return (first + last).toUpperCase()
}

// Danish ø and æ are letters of their own, not accented o and a, so NFD leaves
// them alone; someone typing "soren" still means Søren.
const fold = (s: string) => s.toLowerCase().replace(/ø/g, 'o').replace(/æ/g, 'ae')
    .normalize('NFD').replace(/\p{M}/gu, '')

/** Every typed word must start a word of the name: "an lin" finds Anna Lindberg. */
export function matches(option: PickerOption, query: string): boolean {
    const words = fold(option.label).split(/[\s\-()]+/).filter(Boolean)
    return fold(query).split(/\s+/).filter(Boolean).every(q => words.some(w => w.startsWith(q)))
}

/**
 * Sections to show. Without a query: pinned, then recently used, then everyone
 * else; each person once. With a query: one list of matches, pinned first.
 * Already selected people are left out.
 */
export function pickerSections(
    options: PickerOption[],
    query: string,
    recentUuids: string[],
    selected: string[] = [],
): PickerSection[] {
    const open = options.filter(o => o?.value && !selected.includes(o.value))
    if (query.trim()) {
        const found = open.filter(o => matches(o, query))
        return [{ key: 'matches', options: [...found.filter(o => o.pinned), ...found.filter(o => !o.pinned)] }]
    }
    const pinned = open.filter(o => o.pinned)
    const byUuid = new Map(open.map(o => [o.value, o]))
    const recent = recentUuids.map(u => byUuid.get(u)).filter((o): o is PickerOption => !!o && !o.pinned)
    const shown = new Set([...pinned, ...recent].map(o => o.value))
    const rest = open.filter(o => !shown.has(o.value))
    return [
        { key: 'pinned' as const, options: pinned },
        { key: 'recent' as const, options: recent },
        { key: 'all' as const, options: rest },
    ].filter(s => s.options.length)
}

/** The recent list after picking someone: newest first, no duplicates, at most `max`. */
export function rememberRecent(recent: string[], uuid: string, max = 5): string[] {
    return [uuid, ...recent.filter(u => u !== uuid)].slice(0, max)
}
