export type SidebarPreference = { name: string, visible: boolean, pinned?: boolean }

function asList(preferences: unknown): SidebarPreference[] {
    return Array.isArray(preferences) ? preferences.filter((p) => p && typeof p.name === 'string') : []
}

/** Names of the menu items this user has pinned, in the order they were pinned. */
export function pinnedNames(preferences: unknown): string[] {
    return asList(preferences).filter((p) => p.pinned === true).map((p) => p.name)
}

/**
 * Pins or unpins one item and leaves every other preference as it was. Pinning
 * an item the user had no preference for adds it as visible. Unpinning moves
 * nothing else, and a pinned item goes to the end so new pins appear last.
 */
export function withPin(preferences: unknown, name: string, pinned: boolean): SidebarPreference[] {
    const list = asList(preferences)
    const existing = list.find((p) => p.name === name)
    const rest = list.filter((p) => p.name !== name)
    const updated: SidebarPreference = { ...(existing ?? { name, visible: true }), name, pinned }
    if (!pinned) delete updated.pinned
    return pinned ? [...rest, updated] : [...list.map((p) => (p.name === name ? updated : p))]
}

/**
 * The settings page's show/hide choices, merged into the saved preferences so
 * pins survive it. It used to rebuild the list from scratch as {name, visible},
 * which would have dropped every pin. A hidden item cannot stay pinned.
 */
export function withVisibility(preferences: unknown, visibility: Record<string, boolean>): SidebarPreference[] {
    const list = asList(preferences)
    const byName = new Map(list.map((p) => [p.name, p]))
    const merged = Object.entries(visibility).map(([name, visible]) => {
        const saved = byName.get(name)
        const next: SidebarPreference = { name, visible }
        if (visible && saved?.pinned) next.pinned = true
        return next
    })
    const kept = list.filter((p) => !(p.name in visibility))
    return [...merged, ...kept]
}
