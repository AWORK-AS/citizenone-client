// Tracks whether the onboarding (Discover) journey is fully completed, so the
// prominent Discover tab can graduate away once everything is done. The journey
// stays reachable via the "Get started" sidebar item.
const KEY = 'co_discover_completed'

export function useDiscoverDone() {
    const completed = useState<boolean>('discoverCompleted', () =>
        typeof localStorage !== 'undefined' && localStorage.getItem(KEY) === 'true')

    function markCompleted() {
        completed.value = true
        if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, 'true')
    }

    return { completed, markCompleted }
}
