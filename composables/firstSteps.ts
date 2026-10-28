// The first-steps guide a new user meets instead of a spotlight tour.
//
// One card, one step at a time, and each step is done in place: the note is
// written in the guide, not after hunting for the button. Staff (who arrive in
// their hundreds through an invitation) get three steps on My day; an admin
// gets the setup steps on Discover. Pure, for tests/unit/firstSteps.test.mjs;
// the card is components/modules/user/onboarding/first-steps.vue.

import type { ChecklistStep } from './onboardingProgress'

export type FirstStepsRole = 'staff' | 'admin'

export interface FirstStep {
    key: string
    /** Backend checklist keys that mark this step done; any one is enough. */
    doneBy: string[]
}

const STEPS: Record<FirstStepsRole, FirstStep[]> = {
    staff: [
        { key: 'citizens', doneBy: [] },
        { key: 'note', doneBy: ['journal_note_written'] },
        { key: 'day', doneBy: [] },
    ],
    admin: [
        { key: 'modules', doneBy: [] },
        { key: 'firstCitizen', doneBy: ['citizens_added', 'clients_added'] },
        { key: 'note', doneBy: ['journal_note_written'] },
        { key: 'colleagues', doneBy: ['colleagues_invited'] },
    ],
}

export function firstSteps(role: FirstStepsRole): FirstStep[] {
    return STEPS[role]
}

export function stepDone(step: FirstStep, checklist: ChecklistStep[] | null | undefined): boolean {
    const list = Array.isArray(checklist) ? checklist : []
    return step.doneBy.some(key => list.some(s => s.key === key && s.done === true))
}

/** Where the guide opens: the first step not done yet, else the last one. */
export function startIndex(steps: FirstStep[], checklist: ChecklistStep[] | null | undefined): number {
    const i = steps.findIndex(s => !stepDone(s, checklist))
    return i === -1 ? steps.length - 1 : i
}

/** All the keys the card can show, for the translation check in the tests. */
export const FIRST_STEP_KEYS: Record<FirstStepsRole, string[]> = {
    staff: STEPS.staff.map(s => s.key),
    admin: STEPS.admin.map(s => s.key),
}
