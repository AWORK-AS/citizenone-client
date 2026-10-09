// Milo's welcome tour at first login: the pure decisions behind it.
//
// Kept free of Nuxt auto-imports so tests/unit/welcomeTour.test.mjs can run it
// under `node --test`. Rendering lives in components/modules/user/app/
// tour-guide.vue, the entry point in layouts/user.vue.

export type TourRoute = 'care_home_admin' | 'clinic_admin' | 'staff'

export type WelcomeTourMode =
    /** Backend predates tours_seen: keep today's modal sequence. */
    | 'legacy'
    /** Show the Milo spotlight tour. */
    | 'tour'
    /** Seen, or no route to show. */
    | 'none'

const ROUTES: readonly string[] = ['care_home_admin', 'clinic_admin', 'staff']

export function isTourRoute(value: unknown): value is TourRoute {
    return typeof value === 'string' && ROUTES.includes(value)
}

/** True when the backend sends tours_seen at all (an old backend does not). */
export function hasToursSeen(user: any): boolean {
    const seen = user?.tours_seen
    return !!seen && typeof seen === 'object' && !Array.isArray(seen)
}

/**
 * Whether to show the welcome tour for this user.
 *
 * `tours_seen` absent -> 'legacy', so this can deploy before the backend.
 * Present: shown only while welcome_web is null AND tour_route is known.
 * A route the client does not know counts as no route, so a future backend
 * route never opens an empty tour.
 */
export function welcomeTourMode(user: any): WelcomeTourMode {
    if (!user) return 'none'
    if (!hasToursSeen(user)) return user.is_first_login ? 'legacy' : 'none'
    if (user.tours_seen.welcome_web) return 'none'
    return isTourRoute(user.tour_route) ? 'tour' : 'none'
}

/**
 * First session, for the post-login landing page. With tours_seen the web
 * tour decides; is_first_login is no longer cleared on that path, so it cannot.
 */
export function isFirstSession(user: any): boolean {
    if (!user) return false
    if (hasToursSeen(user)) return !user.tours_seen.welcome_web && isTourRoute(user.tour_route)
    return !!user.is_first_login
}

// --- Steps ---------------------------------------------------------------

export interface WelcomeStep {
    /** i18n key of what Milo says; the bubble carries no separate title. */
    textKey: string
    /** CSS selector of the element to spotlight; none = centred step. */
    selector?: string
    /** Page to be on for the target to exist. */
    route?: string
    /** Company module (Page name) that must be on, else the step is skipped. */
    module?: string
    /** Needs the invoicing app. */
    invoiceApp?: boolean
    /** Finishing the tour from this step opens Milo's chat. */
    openChat?: boolean
}

export interface StepContext {
    /** Fails open on an empty or missing list, like the sidebar does. */
    hasModule: (name: string) => boolean
    hasInvoiceApp: boolean
}

const step = (key: string, extra: Partial<WelcomeStep> = {}): WelcomeStep => ({
    textKey: `welcomeTour.${key}`,
    ...extra,
})

const STEPS: Record<TourRoute, WelcomeStep[]> = {
    care_home_admin: [
        step('careHome.citizens', { selector: '[data-tour="sidebar-citizens"]' }),
        step('careHome.colleagues', { selector: '[data-tour="employees-invite"]', route: '/employees' }),
        step('careHome.today', { selector: '[data-tour="sidebar-overview"]' }),
        step('careHome.journal', { selector: '[data-tour="journal-note-new"]', route: '/journal-notes' }),
        step('careHome.end', { selector: '[data-tour="discover-header"]', route: '/discover', openChat: true }),
    ],
    clinic_admin: [
        step('clinic.calendar', { selector: '[data-tour="sidebar-calendar"]', module: 'Calendar' }),
        step('clinic.booking', { selector: '[data-tour="booking-settings"]', route: '/calendar/bookings/settings', module: 'Calendar' }),
        step('clinic.clients', { selector: '[data-tour="sidebar-citizens"]' }),
        step('clinic.invoices', { selector: '[data-tour="sidebar-invoicing"]', invoiceApp: true }),
        step('clinic.end', { selector: '[data-tour="discover-header"]', route: '/discover', openChat: true }),
    ],
    staff: [
        step('staff.welcome'),
        step('staff.day', { selector: '[data-tour="sidebar-overview"]' }),
        step('staff.messages', { selector: '[data-tour="sidebar-messages"]' }),
        step('staff.end', { openChat: true }),
    ],
}

/** The steps for a route, minus those whose module or app is off for the company. */
export function buildWelcomeSteps(route: unknown, ctx: StepContext): WelcomeStep[] {
    if (!isTourRoute(route)) return []

    return STEPS[route].filter((s) => {
        if (s.module && !ctx.hasModule(s.module)) return false
        if (s.invoiceApp && !ctx.hasInvoiceApp) return false
        return true
    })
}

// --- Discover checklist ---------------------------------------------------

export interface ChecklistResponse {
    route?: string | null
    steps?: { key: string, done: boolean }[]
}

/**
 * Discover step key -> backend checklist key, per route. A step that is not
 * listed (departments, roles, shift types ...) has no backend counterpart and
 * keeps the browser-side behaviour.
 */
const CHECKLIST_KEYS: Record<string, Record<string, string>> = {
    care_home_admin: {
        citizens: 'citizens_added',
        employees: 'colleagues_invited',
        schedule: 'duty_schedule_created',
        medicine: 'medicine_added',
    },
    clinic_admin: {
        patients: 'clients_added',
        employees: 'colleagues_invited',
    },
}

/**
 * Whether the backend says a Discover step is done: true / false, or null when
 * there is no answer (no checklist, unmapped step, key absent). Null means
 * "ask localStorage as before".
 */
export function checklistDone(checklist: ChecklistResponse | null | undefined, discoverStepKey: string): boolean | null {
    if (!checklist || !Array.isArray(checklist.steps)) return null
    const backendKey = CHECKLIST_KEYS[String(checklist.route ?? '')]?.[discoverStepKey]
    if (!backendKey) return null
    const found = checklist.steps.find((s) => s?.key === backendKey)
    return typeof found?.done === 'boolean' ? found.done : null
}

/**
 * The route a manual restart ("Vis mig rundt") plays. The backend's own
 * tour_route wins; without one (old backend, or a user it has no route for)
 * it is derived from what the client knows, the same split the backend uses.
 */
export function restartRoute(user: any, isManagerOrAbove: boolean): TourRoute {
    if (isTourRoute(user?.tour_route)) return user.tour_route
    // The backend gives the admin routes from Manager (level 50) up.
    if (!isManagerOrAbove) return 'staff'
    const industry = user?.company?.industry
    const careHome = !industry
        || industry.system_name === 'social_welfare'
        || industry.en_name === 'Social welfare services'
    return careHome ? 'care_home_admin' : 'clinic_admin'
}
