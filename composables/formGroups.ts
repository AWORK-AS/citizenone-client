import { citizenScaleScoreService } from '@/components/api/user/CitizenScaleScoreService'
import { scaleAnswerOf } from '@/composables/scaleAnswer'

/**
 * A repeating group unfolds before the fill-in renders, not inside the template.
 *
 * The modals walk a flat list of fields and every block type has its own branch
 * there. Expanding here keeps that list flat, so a group needs no new concept in
 * five different templates, and each copy carries the repetition it belongs to,
 * which is what its answer is filed under.
 */
export function useFormGroups() {
    /**
     * @param formUuid the template being filled in. With it, a group that also
     * repeats for completed goals only takes the ones completed since the
     * previous finished report from this template.
     */
    async function expandGroups(fields: any[], citizenUuid: string, formUuid = '') {
        const groups = fields.filter((f: any) => parse(f)?.type === 'group')
        // A question whose group was deleted from the template still names it.
        // It is an ordinary question again, not hidden as a child of nothing.
        const groupIds = new Set(groups.map((g: any) => parse(g)?.groupId).filter(Boolean))
        const inGroup = (config: any) => !!config?.parentGroup && groupIds.has(config.parentGroup)
        const perGoalRulers = fields.filter((f: any) => isPerGoalRuler(parse(f), inGroup))

        if (groups.length === 0 && perGoalRulers.length === 0) return fields

        const iterationsByGroup: Record<string, any[]> = {}

        for (const group of groups) {
            const config = parse(group)
            iterationsByGroup[config.groupId] = await iterationsFor(citizenUuid, config, formUuid)
        }

        // "Repeat the ruler for each goal": once per active goal, each filed
        // under its goal like a ruler inside a group repeated per goal.
        const activeGoals = perGoalRulers.length > 0
            ? await iterationsFor(citizenUuid, { repeatFor: 'goals', includeCompleted: false }, formUuid)
            : []

        const out: any[] = []

        for (const field of fields) {
            const config = parse(field)

            // Children are emitted by their group, never on their own.
            if (inGroup(config)) continue

            if (isPerGoalRuler(config, inGroup)) {
                // A case without goals still gets its one ruler.
                if (activeGoals.length === 0) {
                    out.push(field)

                    continue
                }

                for (const goal of activeGoals) {
                    out.push({
                        uuid: `${field.uuid}::title::${goal.key}`,
                        _skipInPayload: true,
                        field: JSON.stringify({
                            type: 'group_title',
                            value: `${config.value ?? ''}: ${goal.label}`.trim(),
                        }),
                    })
                    out.push({ ...field, responses: '', _iterationKey: goal.key, _goalUuid: goal.key })
                }

                continue
            }

            if (config?.type !== 'group') {
                out.push(field)

                continue
            }

            const children = fields.filter((f: any) => parse(f)?.parentGroup === config.groupId)
            const iterations = iterationsByGroup[config.groupId] ?? []

            if (iterations.length === 0) {
                out.push({
                    ...field,
                    _skipInPayload: true,
                    field: JSON.stringify({ type: 'group_empty', value: config.value }),
                })

                continue
            }

            for (const iteration of iterations) {
                out.push({
                    uuid: `${field.uuid}::title::${iteration.key}`,
                    _skipInPayload: true,
                    field: JSON.stringify({
                        type: 'group_title',
                        value: `${config.value ?? ''} ${iteration.number}${iteration.label ? ': ' + iteration.label : ''}`.trim(),
                    }),
                })

                for (const child of children) {
                    const childConfig = parse(child)
                    childConfig.value = substitute(String(childConfig.value ?? ''), iteration, iterations.length)

                    out.push({
                        ...child,
                        field: JSON.stringify(childConfig),
                        responses: childConfig.type === 'checkbox' ? [] : '',
                        _iterationKey: iteration.key,
                        // A ruler in a goal's repetition shows that goal's history.
                        ...(iteration.goal_id ? { _goalUuid: iteration.key } : {}),
                    })
                }
            }
        }

        return out
    }

    /**
     * Puts a reopened report's answers back on the questions they answer. An
     * answer inside a group goes back to its own repetition: matched by the
     * question alone, every goal showed the last goal's answer, and saving
     * again copied that answer to all of them.
     */
    function restoreResponses(fields: any[], saved: any[] = []) {
        // A server that does not say which repetition an answer belongs to
        // gets the old matching, by question only.
        const knowsIterations = saved.some((row: any) => row && 'iteration_key' in row)

        for (const field of fields) {
            if (field?._skipInPayload) continue

            const iterationKey = field._iterationKey ?? null
            const hit = saved.find((row: any) => row?.form_field_id === field.id
                && (!knowsIterations || (row.iteration_key ?? null) === iterationKey))

            if (!hit) continue

            // A checkbox answer is stored as a JSON list and must come back as
            // one, or ticking a box in the reopened report fails. A ruler's
            // comes back as the object it sends: put back as the stored string,
            // an untouched ruler sent that string encoded once more and showed
            // empty from then on.
            const type = parse(field)?.type
            field.responses = type === 'checkbox'
                ? asList(hit.response)
                : type === 'scale' ? (scaleAnswerOf(hit.response) ?? '') : hit.response
        }
    }

    function asList(value: any): string[] {
        if (Array.isArray(value)) return [...value]
        if (typeof value !== 'string' || value === '') return []

        try {
            const parsed = JSON.parse(value)

            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    }

    /**
     * The answer key for a field, carrying its repetition when it has one.
     * Returns null for the headings the expansion inserts, which hold no answer.
     */
    function responseKey(field: any): string | null {
        if (field?._skipInPayload) return null

        return field?._iterationKey ? `${field.uuid}::${field._iterationKey}` : field.uuid
    }

    async function iterationsFor(citizenUuid: string, config: any, formUuid = '') {
        // Drive reports are not about anyone, so a group there has nothing to
        // repeat over and says so rather than failing.
        if (!citizenUuid) return []

        try {
            const response = await citizenScaleScoreService.getGroupIterations(citizenUuid, {
                repeat_for: config.repeatFor ?? 'goals',
                include_completed: config.includeCompleted ? 1 : 0,
                count: config.count ?? 3,
                ...(formUuid ? { form_uuid: formUuid } : {}),
            })

            return response?.data ?? []
        } catch {
            return []
        }
    }

    function isPerGoalRuler(config: any, inGroup: (config: any) => boolean): boolean {
        return config?.type === 'scale' && config?.perGoal === true && !inGroup(config)
    }

    function parse(field: any) {
        try {
            return JSON.parse(field?.field ?? '{}')
        } catch {
            return {}
        }
    }

    function substitute(text: string, iteration: any, total: number) {
        return text
            .replaceAll('{{gentagelse.navn}}', iteration.label ?? '')
            .replaceAll('{{gentagelse.nummer}}', String(iteration.number))
            .replaceAll('{{gentagelse.i_alt}}', String(total))
    }

    return { expandGroups, responseKey, restoreResponses }
}
