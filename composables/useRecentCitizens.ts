// Tracks recently visited and pinned citizens, persisted to localStorage and
// shared reactively across the app (e.g. the command palette).
const RECENT_KEY = 'recentCitizens'
const PINNED_KEY = 'pinnedCitizens'
const MAX_RECENT = 8
const MAX_PINNED = 12

interface CitizenRef {
    uuid: string
    name: string
    image?: string | null
}

function loadList(key: string): CitizenRef[] {
    if (typeof localStorage === 'undefined') return []
    try {
        return JSON.parse(localStorage.getItem(key) || '[]')
    } catch {
        return []
    }
}

function persist(key: string, value: CitizenRef[]) {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(value))
}

function toRef(citizen: any): CitizenRef | null {
    const name = [citizen?.firstname, citizen?.lastname].filter(Boolean).join(' ') || citizen?.name || ''
    if (!citizen?.uuid || !name) return null
    return { uuid: citizen.uuid, name, image: citizen.image ?? null }
}

export function useRecentCitizens() {
    const recents = useState<CitizenRef[]>('recentCitizens', () => loadList(RECENT_KEY))
    const pinned = useState<CitizenRef[]>('pinnedCitizens', () => loadList(PINNED_KEY))

    function recordVisit(citizen: any) {
        const entry = toRef(citizen)
        if (!entry) return
        recents.value = [entry, ...recents.value.filter(r => r.uuid !== entry.uuid)].slice(0, MAX_RECENT)
        persist(RECENT_KEY, recents.value)
    }

    function isPinned(uuid: string) {
        return pinned.value.some(p => p.uuid === uuid)
    }

    function togglePin(citizen: any) {
        const uuid = citizen?.uuid
        if (!uuid) return
        if (isPinned(uuid)) {
            pinned.value = pinned.value.filter(p => p.uuid !== uuid)
        } else {
            const entry = toRef(citizen)
            if (!entry) return
            pinned.value = [entry, ...pinned.value].slice(0, MAX_PINNED)
        }
        persist(PINNED_KEY, pinned.value)
    }

    return { recents, pinned, recordVisit, isPinned, togglePin }
}
