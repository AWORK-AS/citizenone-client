// Milo's welcome tour: shared state and the calls around it.
//
// The user layout is mounted by every page, so it is torn down and rebuilt on
// each navigation. The tour walks across pages, hence its position lives here
// in useState and not in a component.

import { userService } from '@/components/api/user/UserService'
import { useUserStore } from '@/store/user'
import {
    buildWelcomeSteps,
    hasToursSeen,
    restartRoute,
    welcomeTourMode,
    type TourRoute,
    type WelcomeStep,
} from '@/composables/welcomeTour'

interface WelcomeTourState {
    active: boolean
    route: TourRoute | null
    index: number
    /** Started once per page load: a layout remount must not start it again. */
    launched: boolean
    /** A manual restart: finishing it does not write to the backend. */
    restart: boolean
}

export function useWelcomeTour() {
    const userStore = useUserStore() as any
    const { isAtLeast } = usePermissions()
    const { revealAndOpenChat } = useObiyenChat()

    const tour = useState<WelcomeTourState>('welcomeTour', () => ({
        active: false, route: null, index: 0, launched: false, restart: false,
    }))

    const steps = computed<WelcomeStep[]>(() => {
        const user = userStore.getUser
        const modules = user?.company?.module_pages
        return buildWelcomeSteps(tour.value.route, {
            hasModule: (name: string) => !Array.isArray(modules) || modules.length === 0 || modules.includes(name),
            hasInvoiceApp: !!user?.has_invoice_app,
        })
    })

    function startIfDue(user: any): 'legacy' | 'tour' | 'none' {
        const mode = welcomeTourMode(user)
        if (mode === 'tour' && !tour.value.launched) {
            tour.value = { active: true, route: user.tour_route, index: 0, launched: true, restart: false }
        }
        return mode
    }

    /** "Vis mig rundt": plays the tour whether or not it has been seen. */
    function restart() {
        const route = restartRoute(userStore.getUser, isAtLeast('Admin'))
        tour.value = { active: true, route, index: 0, launched: true, restart: true }
    }

    function setIndex(index: number) {
        tour.value.index = index
    }

    /** Finish or skip. `finished` is true only for the last step's button. */
    async function close(finished: boolean) {
        const openChat = finished && !!steps.value[tour.value.index]?.openChat
        const wasRestart = tour.value.restart
        tour.value = { ...tour.value, active: false, index: 0 }

        if (openChat) revealAndOpenChat()

        const user = userStore.getUser
        // Nothing to record for a replay, or where the backend has no tour support.
        if (wasRestart || !hasToursSeen(user) || user.tours_seen.welcome_web) return
        try {
            const response = await userService.markTourSeen('welcome_web')
            if (response?.tours_seen) userStore.setUser({ ...userStore.getUser, tours_seen: response.tours_seen })
        } catch {
            // Not worth an error toast. `launched` keeps it from reopening this
            // page load; the next login asks again.
        }
    }

    return { tour, steps, startIfDue, restart, setIndex, close }
}
