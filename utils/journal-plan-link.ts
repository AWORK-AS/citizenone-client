// A journal note is attached to a plan, a goal, a sub-goal or a single goal
// (enkeltmål). The backend takes one uuid: the most specific item picked.
// A single goal belongs to no plan, so it is picked instead of plan + goal.
export function journalNotePlanGoalSubgoalUuid(form: any): string {
    return form?.journal_note_subgoal
        || form?.journal_note_goal
        || form?.journal_note_single_goal
        || form?.journal_note_plan
        || ''
}

// The attachment part of a journal create/update request.
//
// `isUpdate` makes an unticked box mean "detach": the server leaves an
// attachment alone unless it is told to remove it, because only an edit form
// can show it. Detaching a note with nothing attached is a no-op.
export function journalNotePlanLinkParams(form: any, isUpdate = false): Record<string, any> {
    const attach = !!form?.copy_journal_note_to_plan_or_goal_or_subgoal
    return {
        copy_journal_note_to_plan_or_goal_or_subgoal: attach,
        journal_note_plan_goal_subgoal_uuid: attach ? journalNotePlanGoalSubgoalUuid(form) : '',
        ...(isUpdate ? { remove_journal_note_plan_goal_subgoal: !attach } : {}),
    }
}
