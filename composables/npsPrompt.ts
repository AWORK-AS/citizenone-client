// The "would you recommend CitizenOne?" card (ModulesUserNpsPrompt). Pure, so it runs under
// node --test; the backend decides who is asked (App\Service\NpsService), this only decides
// whether the card may appear on this screen right now.

export const NPS_SCALE: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export type NpsBand = 'detractor' | 'passive' | 'promoter'

/** The usual NPS bands: 0-6, 7-8, 9-10. Same cut as the backend's DETRACTOR_MAX. */
export function npsBand(score: number): NpsBand {
    if (score >= 9) return 'promoter'
    if (score >= 7) return 'passive'
    return 'detractor'
}

/**
 * Never while one of our own is impersonating the customer (the answer would be ours, filed
 * under their name), and never on a screen where a person is in the middle of something
 * that a card over the corner would get in the way of.
 */
const BUSY_PATHS = ['/discover', '/register', '/setup-password']

export function mayShowNpsPrompt(input: { show: boolean | undefined, impersonating: boolean, path: string }): boolean {
    return input.show === true
        && !input.impersonating
        && !BUSY_PATHS.some(p => input.path === p || input.path.startsWith(`${p}/`))
}

/** NPS = % promoters - % detractors, rounded; null with no answers. Mirrors the backend. */
export function npsScore(scores: readonly number[]): number | null {
    if (scores.length === 0) return null
    const promoters = scores.filter(s => s >= 9).length
    const detractors = scores.filter(s => s <= 6).length
    return Math.round(((promoters - detractors) / scores.length) * 100)
}
