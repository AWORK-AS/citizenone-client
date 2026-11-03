/**
 * Moving questions up and down in the survey builder. A follow-up refers to
 * its parent's key through show_if.question and sits right below it, after
 * any earlier follow-ups of the same parent. A question therefore moves
 * together with its follow-ups, and only past a question with the same
 * parent, so follow-ups always stay under their parent.
 *
 * Kept free of Vue so it can be unit tested.
 */
export interface BuilderQuestionLike {
    key: string
    show_if?: { question?: string } | null
}

function parentKeyOf(questions: BuilderQuestionLike[], question: BuilderQuestionLike): string | undefined {
    const key = question.show_if?.question
    return key && questions.some(q => q.key === key) ? key : undefined
}

function isDescendantOf(questions: BuilderQuestionLike[], question: BuilderQuestionLike, ancestorKey: string): boolean {
    let parentKey = parentKeyOf(questions, question)
    for (let i = 0; parentKey && i < questions.length; i++) {
        if (parentKey === ancestorKey) return true
        parentKey = parentKeyOf(questions, questions.find(q => q.key === parentKey)!)
    }
    return false
}

function lastDescendantIndex(questions: BuilderQuestionLike[], index: number): number {
    const key = questions[index].key
    let end = index
    while (end + 1 < questions.length && isDescendantOf(questions, questions[end + 1], key)) end++
    return end
}

/**
 * The index of the previous or next question with the same parent, skipping
 * the follow-ups in between, or undefined when there is none to move past.
 */
export function adjacentSiblingIndex(questions: BuilderQuestionLike[], index: number, direction: -1 | 1): number | undefined {
    const parentKey = parentKeyOf(questions, questions[index])
    for (let i = index + direction; i >= 0 && i < questions.length; i += direction) {
        if (parentKeyOf(questions, questions[i]) === parentKey) return i
        if (parentKey && !isDescendantOf(questions, questions[i], parentKey)) return undefined
    }
    return undefined
}

/** Moves the question at index (with its follow-ups) one place up or down, in place. */
export function moveSurveyQuestion(questions: BuilderQuestionLike[], index: number, direction: -1 | 1): void {
    const sibling = adjacentSiblingIndex(questions, index, direction)
    if (sibling === undefined) return
    const [first, second] = direction === -1 ? [sibling, index] : [index, sibling]
    const block = questions.splice(second, lastDescendantIndex(questions, second) - second + 1)
    questions.splice(first, 0, ...block)
}
