// "How many are you?" - asked on /discover right after signup, never in the
// signup form, so it cannot cost a signup. Stored by the backend in
// company.onboarding_preferences.team_size.
//
// The answer does three things, all here so they can be tested without a page:
// it trims or reorders the getting-started journey, it picks the plan to
// recommend while the company is on the free account, and (backend side) an
// 11+ answer becomes a lead for sales.

import type { DiscoverGroup } from './useDiscoverJourney'

export const TEAM_SIZES = ['solo', '2-4', '5-10', '11+'] as const
export type TeamSize = typeof TEAM_SIZES[number]

export type Plan = 'basis' | 'pro'

export function isTeamSize(value: unknown): value is TeamSize {
    return typeof value === 'string' && (TEAM_SIZES as readonly string[]).includes(value)
}

// Plan facts (2026-10-26): free = 1 user, Basis = 2 included and at most 4,
// Pro = 4 included and more on top. One person stays free.
export function recommendedPlan(size: TeamSize | null | undefined): Plan | null {
    if (size === '2-4') return 'basis'
    if (size === '5-10' || size === '11+') return 'pro'
    return null
}

// Departments, roles, inviting colleagues and the duty schedule are a team's
// set-up: one person working alone has nobody to invite or roster. A bigger team
// meets them right after its people and the import, not at the bottom.
const TEAM_GROUPS = ['komIGang', 'vagtplan']

export function journeyForTeam(groups: DiscoverGroup[], size: TeamSize | null | undefined): DiscoverGroup[] {
    if (size === 'solo') return groups.filter(group => !TEAM_GROUPS.includes(group.key))

    if (size === '5-10' || size === '11+') {
        const team = groups.find(group => group.key === 'komIGang')
        if (!team) return groups
        const rest = groups.filter(group => group !== team)
        const after = rest.findIndex(group => group.key === 'migration')
        rest.splice(after === -1 ? 1 : after + 1, 0, team)
        return rest
    }

    return groups
}
