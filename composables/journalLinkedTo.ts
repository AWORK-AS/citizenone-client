/**
 * Resolves the "Copy to plan, goal, or subgoal" checkbox's link on a journal
 * note into a breadcrumb label and a deep link back to the plans-and-goals
 * page, from the `linked_to` shape the API returns:
 * { type: 'plan'|'goal'|'subgoal', plan?: {uuid,name}, goal?: {uuid,name}, subgoal?: {uuid,name} }
 *
 * Kept free of Vue so it can be reused identically across every journal list
 * page without each one re-deriving the label/URL logic on its own.
 */
export interface JournalLinkedTo {
    type: 'plan' | 'goal' | 'subgoal'
    plan?: { uuid: string, name: string } | null
    goal?: { uuid: string, name: string } | null
    subgoal?: { uuid: string, name: string } | null
}

export function linkedToLabel(linkedTo: JournalLinkedTo | null | undefined): string {
    if (!linkedTo) return ''

    return [linkedTo.plan?.name, linkedTo.goal?.name, linkedTo.subgoal?.name]
        .filter(Boolean)
        .join(' / ')
}

/**
 * `plansAndGoalsBasePath` is the citizen-scoped plans-and-goals "all" page to
 * link into - different for a child citizen (nested under
 * /children/{child_uuid}/) than for the primary citizen, so callers pass it
 * in rather than this composable guessing the citizen hierarchy.
 */
export function linkedToHref(plansAndGoalsBasePath: string, linkedTo: JournalLinkedTo | null | undefined): string {
    if (!linkedTo) return ''

    const params = new URLSearchParams()
    if (linkedTo.plan?.uuid) params.set('plan_uuid', linkedTo.plan.uuid)
    if (linkedTo.goal?.uuid) params.set('goal_uuid', linkedTo.goal.uuid)
    if (linkedTo.subgoal?.uuid) params.set('subgoal_uuid', linkedTo.subgoal.uuid)

    return `${plansAndGoalsBasePath}?${params.toString()}`
}
