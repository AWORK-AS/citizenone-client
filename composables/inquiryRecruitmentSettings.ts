/**
 * The recruitment team settings: who is told when a case needs a consultant,
 * and the switch that turns those messages off without forgetting the team.
 */

export type RecruitmentForm = {
    enabled: boolean
    employee_group_uuids: string[]
    user_uuids: string[]
    task_board_uuid: string
}

/** What the line under the form says: off, nobody to tell, or how many. */
export function recruitmentStatus(enabled: boolean, recipientCount: number): 'off' | 'nobody' | 'count' {
    if (!enabled) return 'off'
    return recipientCount > 0 ? 'count' : 'nobody'
}

/** The settings as the API answers them, onto the form. Missing switch = on (older backend). */
export function recruitmentFormFrom(data: any): RecruitmentForm {
    return {
        enabled: data?.enabled !== false,
        employee_group_uuids: (data?.employee_groups ?? []).map((group: any) => group.uuid),
        user_uuids: (data?.users ?? []).map((user: any) => user.uuid),
        task_board_uuid: data?.task_board?.uuid ?? '',
    }
}

export function recruitmentPayload(form: RecruitmentForm) {
    return {
        enabled: form.enabled,
        employee_group_uuids: form.employee_group_uuids,
        user_uuids: form.user_uuids,
        task_board_uuid: form.task_board_uuid || null,
    }
}
