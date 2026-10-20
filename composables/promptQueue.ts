// "One unsolicited prompt at a time": the pure decisions behind usePromptCoordinator.
//
// Kept free of Nuxt auto-imports so tests/unit/promptQueue.test.mjs can run it under
// `node --test`. A prompt is anything the app puts in front of a person unasked: a security
// modal, a tour, a tip, a banner, a survey. Lower number = shown first.

export type PromptId =
    | 'security2fa'
    | 'tour'
    | 'checkinReminder'
    | 'completionReminder'
    | 'cmdkTip'
    | 'codyBanner'
    | 'nps'

export const PROMPT_PRIORITY: Record<PromptId, number> = {
    security2fa: 0,
    tour: 10,
    checkinReminder: 20,
    completionReminder: 21,
    cmdkTip: 30,
    codyBanner: 40,
    nps: 50,
}

/** Prompts that may not appear before the page load is this old. */
export const PROMPT_MIN_AGE_MS: Partial<Record<PromptId, number>> = {
    nps: 10 * 60 * 1000,
}

/** Prompts that do not wait out the pause after the previous one. */
const NO_COOLDOWN: readonly PromptId[] = ['security2fa', 'tour']

/** The quiet gap after a prompt is dismissed, before the next unsolicited one. */
export const PROMPT_COOLDOWN_MS = 90_000

export interface PromptState {
    active: PromptId | null
    /** Already shown in this page load: shown once, not again after a navigation. */
    served: PromptId[]
    releasedAt: number | null
}

export function initialPromptState(): PromptState {
    return { active: null, served: [], releasedAt: null }
}

/**
 * Decides who holds the slot. `requested` is every prompt that wants to show right now.
 * The holder keeps it until it is released, except that a security prompt or the tour takes
 * over (the preempted one is not marked served, so it returns afterwards).
 */
export function arbitrate(state: PromptState, requested: readonly PromptId[], now: number, sessionStart: number): PromptState {
    const eligible = requested
        .filter((id) => {
            if (id === state.active) return true
            if (state.served.includes(id)) return false
            if (now - sessionStart < (PROMPT_MIN_AGE_MS[id] ?? 0)) return false
            if (NO_COOLDOWN.includes(id) || state.releasedAt === null) return true
            return now - state.releasedAt >= PROMPT_COOLDOWN_MS
        })
        .sort((a, b) => PROMPT_PRIORITY[a] - PROMPT_PRIORITY[b])
    const best = eligible[0]
    if (!best || best === state.active) return state

    if (state.active === null) {
        return { ...state, active: best, served: [...state.served, best] }
    }
    // Between page changes the holder's component is briefly gone; it keeps the slot, and
    // only a security prompt or the tour (which cannot wait) takes it over. Anything else
    // would make a visible prompt flicker away.
    if (!NO_COOLDOWN.includes(best) || PROMPT_PRIORITY[best] >= PROMPT_PRIORITY[state.active]) return state
    return {
        ...state,
        active: best,
        served: [...state.served.filter(id => id !== state.active), best],
    }
}

/** The holder was dismissed or finished. Anyone else is ignored. */
export function release(state: PromptState, id: PromptId, now: number): PromptState {
    if (state.active !== id) return state
    return { ...state, active: null, releasedAt: now }
}
