/**
 * Roadmap #501: group chats linked to a department or an employee group.
 * Their members follow the department or group, so the chat says why you are
 * in it, and nobody adds, removes or leaves by hand.
 *
 * Plain functions (no Vue) so they can be unit tested with node.
 */

export interface LinkedChatLike {
    linked_to?: { type?: string | null, name?: string | null } | null
    is_managed?: boolean | null
    archived_at?: string | null
}

type Translate = (key: string, values?: Record<string, unknown>) => string

/** "Afdeling Nord", "Gruppe: Nattevagter", or '' for an ordinary chat. */
export function linkedChatLabel(chat: LinkedChatLike | null | undefined, t: Translate): string {
    const name = chat?.linked_to?.name?.trim()
    if (!name) return ''

    return chat?.linked_to?.type === 'employee_group'
        ? t('messages.linkedChat.groupLabel', { name })
        : name
}

/** Members are kept by the system: no add, remove or leave. */
export function isManagedChat(chat: LinkedChatLike | null | undefined): boolean {
    return chat?.is_managed === true
}

/** Read-only, once its department or group was deleted. */
export function isArchivedChat(chat: LinkedChatLike | null | undefined): boolean {
    return !!chat?.archived_at
}

export type LinkTarget = 'none' | 'department' | 'employee_group'

/**
 * What the new-chat form sends to create a linked chat, or null while the
 * choice is incomplete.
 */
export function linkedChatPayload(target: LinkTarget, uuid: string | null | undefined, name: string | null | undefined): Record<string, string> | null {
    if (target === 'none' || !uuid) return null

    const payload: Record<string, string> = { type: 'group' }
    payload[target === 'department' ? 'department_uuid' : 'employee_group_uuid'] = uuid
    const trimmed = (name ?? '').trim()
    if (trimmed) payload.name = trimmed

    return payload
}

/**
 * The departments and groups a user may link a chat to: everything for an
 * admin, a manager's own departments and those departments' groups. The
 * server checks the same; this only keeps the lists honest.
 */
export function linkableOptions<T extends { uuid: string, id?: number, department_id?: number | null, department?: { id?: number } | null }>(
    items: T[],
    kind: 'department' | 'employee_group',
    isAdmin: boolean,
    ownDepartmentIds: number[],
): T[] {
    if (isAdmin) return items
    const own = new Set(ownDepartmentIds.map(Number))
    return items.filter((item) => {
        if (kind === 'department') return own.has(Number(item.id))
        const departmentId = item.department_id ?? item.department?.id
        return departmentId != null && own.has(Number(departmentId))
    })
}
