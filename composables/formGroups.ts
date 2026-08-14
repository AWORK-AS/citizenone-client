import { citizenScaleScoreService } from '@/components/api/user/CitizenScaleScoreService'

/**
 * A repeating group unfolds before the fill-in renders, not inside the template.
 *
 * The modals walk a flat list of fields and every block type has its own branch
 * there. Expanding here keeps that list flat, so a group needs no new concept in
 * five different templates, and each copy carries the repetition it belongs to,
 * which is what its answer is filed under.
 */
export function useFormGroups() {
    async function expandGroups(fields: any[], citizenUuid: string) {
        const groups = fields.filter((f: any) => parse(f)?.type === 'group')

        if (groups.length === 0) return fields

        const iterationsByGroup: Record<string, any[]> = {}

        for (const group of groups) {
            const config = parse(group)
            iterationsByGroup[config.groupId] = await iterationsFor(citizenUuid, config)
        }

        const out: any[] = []

        for (const field of fields) {
            const config = parse(field)

            // Children are emitted by their group, never on their own.
            if (config?.parentGroup) continue

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
                    })
                }
            }
        }

        return out
    }

    /**
     * The answer key for a field, carrying its repetition when it has one.
     * Returns null for the headings the expansion inserts, which hold no answer.
     */
    function responseKey(field: any): string | null {
        if (field?._skipInPayload) return null

        return field?._iterationKey ? `${field.uuid}::${field._iterationKey}` : field.uuid
    }

    async function iterationsFor(citizenUuid: string, config: any) {
        // Drive reports are not about anyone, so a group there has nothing to
        // repeat over and says so rather than failing.
        if (!citizenUuid) return []

        try {
            const response = await citizenScaleScoreService.getGroupIterations(citizenUuid, {
                repeat_for: config.repeatFor ?? 'goals',
                include_completed: config.includeCompleted ? 1 : 0,
                count: config.count ?? 3,
            })

            return response?.data ?? []
        } catch {
            return []
        }
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

    return { expandGroups, responseKey }
}
