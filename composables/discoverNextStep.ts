// The one thing Discover asks a new company to do next.
//
// Twelve steps in six groups told a new customer everything at once and nothing
// first. The backend checklist (GET /user/onboarding/checklist) already names
// the handful of milestones that matter, the same ones the topbar pill counts,
// so the card at the top of Discover shows the first of those still open.
// Pure, for tests/unit/discoverNextStep.test.mjs.

import type { ChecklistStep } from './onboardingProgress'

export interface NextStep {
    key: string
    route: string
}

const ROUTES: Record<string, string> = {
    citizens_added: '/citizens/new',
    clients_added: '/citizens/new',
    journal_note_written: '/overview?action=new-note',
    colleagues_invited: '/employees',
    duty_schedule_created: '/schedules',
    medicine_added: '/citizens',
    services_created: '/calendar/bookings/settings',
    online_booking_enabled: '/calendar/bookings/settings',
    profile_completed: '/settings/profile',
}

// The first person and the first note are where the product starts paying back,
// so they come before setting up a clinic's booking or inviting colleagues,
// whatever order the backend lists them in.
const FIRST = ['clients_added', 'citizens_added', 'journal_note_written']

export function nextStep(steps: ChecklistStep[] | null | undefined): NextStep | null {
    const open = (Array.isArray(steps) ? steps : []).filter(s => s?.done === false && ROUTES[s.key])
    const pick = FIRST.map(key => open.find(s => s.key === key)).find(Boolean) ?? open[0]

    return pick ? { key: pick.key, route: ROUTES[pick.key] } : null
}

/** The keys this card can show, for the translation check in the tests. */
export const NEXT_STEP_KEYS = Object.keys(ROUTES)
