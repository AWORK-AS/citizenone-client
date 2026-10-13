/**
 * Follow-up questions in surveys. A follow-up carries
 * show_if = { question: <parent uuid>, options: [<option indexes>] } and is
 * only shown while its parent is shown and the parent's choice/checkbox answer
 * picked one of those options. A reference to a question that is not in the
 * survey counts as no condition. Mirrors Survey::visibleQuestionUuids on the
 * backend, which drops answers to hidden follow-ups on submit.
 *
 * Kept free of Vue so the filling screens and the staff answer views share it.
 */
export interface SurveyQuestionLike {
    uuid: string
    question?: any
}

function definitionOf(question: SurveyQuestionLike): any {
    const q = question?.question ?? question
    try {
        return typeof q === 'string' ? JSON.parse(q) : q
    } catch {
        return null
    }
}

export function visibleSurveyQuestions<T extends SurveyQuestionLike>(questions: T[], answers: Record<string, any>): T[] {
    const byUuid = new Map(questions.map(q => [q.uuid, q]))
    const visible = new Map<string, boolean>()

    const resolve = (question: T, seen: Set<string>): boolean => {
        if (visible.has(question.uuid)) return visible.get(question.uuid)!
        if (seen.has(question.uuid)) return false

        const showIf = definitionOf(question)?.show_if
        const parent = showIf?.question ? byUuid.get(showIf.question) : undefined
        if (!parent) {
            visible.set(question.uuid, true)
            return true
        }

        let shown = resolve(parent, new Set([...seen, question.uuid]))
        if (shown) {
            const answer = answers?.[parent.uuid]
            const picked = Array.isArray(answer) ? answer : (answer === undefined || answer === null || answer === '' ? [] : [answer])
            const options: number[] = (showIf.options ?? []).map(Number)
            shown = picked.some((p: any) => options.includes(Number(p)))
        }
        visible.set(question.uuid, shown)
        return shown
    }

    return questions.filter(q => resolve(q, new Set()))
}

/** How many follow-up levels deep a question sits, for indenting it under its parent. */
export function surveyQuestionDepth(question: SurveyQuestionLike, questions: SurveyQuestionLike[]): number {
    const byUuid = new Map(questions.map(q => [q.uuid, q]))
    let depth = 0
    let parent = byUuid.get(definitionOf(question)?.show_if?.question)
    while (parent && depth < questions.length) {
        depth++
        parent = byUuid.get(definitionOf(parent)?.show_if?.question)
    }
    return depth
}
