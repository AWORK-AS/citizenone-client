// The getting-started count in the topbar (ModulesUserOnboardingProgressPill).
// Pure so it can be tested with node --test; the component only feeds it.

export interface ChecklistStep {
    key: string
    done: boolean
}

export function onboardingProgress(steps: ChecklistStep[] | null | undefined): { done: number, total: number } {
    const list = Array.isArray(steps) ? steps : []
    return { done: list.filter(s => s?.done === true).length, total: list.length }
}

/**
 * Shown to admins until every checklist step is done or the Discover journey
 * has been completed, and never on /discover itself, where the full progress
 * is already on screen. No checklist (an older backend) shows nothing.
 */
export function showProgressPill(input: {
    isAdmin: boolean
    discoverCompleted: boolean
    steps: ChecklistStep[] | null | undefined
    path: string
}): boolean {
    const { done, total } = onboardingProgress(input.steps)
    return input.isAdmin
        && !input.discoverCompleted
        && total > 0
        && done < total
        && input.path !== '/discover'
}
