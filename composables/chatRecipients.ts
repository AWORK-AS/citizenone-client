/**
 * Who a new chat goes to, kept in two lists so a colleague and a citizen are never picked from the same
 * dropdown by mistake: sensitive information meant for a colleague must not reach a citizen. Kept free of
 * Vue so it can be unit tested.
 */

export type RecipientType = 'employees' | 'citizens'

export type RecipientOption = { value: string, label: string }

const fullName = (person: any) => `${person?.firstname ?? ''} ${person?.lastname ?? ''}`.trim()

/** Colleagues from the employee list. The list's own "All employees" entry stays, as before. */
export function employeeRecipientOptions(employees: any[] | null | undefined): RecipientOption[] {
    return (employees ?? [])
        .filter((person: any) => person?.uuid)
        .map((person: any) => ({ value: person.uuid, label: fullName(person) }))
}

/** Citizens with portal access, from the chat members list (role Citizen); staff in that list are skipped. */
export function citizenRecipientOptions(members: any[] | null | undefined): RecipientOption[] {
    return (members ?? [])
        .filter((person: any) => person?.uuid && person?.role === 'Citizen')
        .map((person: any) => ({ value: person.uuid, label: fullName(person) }))
}

/** Colleagues from the chat members list (everyone who is not a citizen), for adding to a group chat. */
export function staffRecipientOptions(members: any[] | null | undefined): RecipientOption[] {
    return (members ?? [])
        .filter((person: any) => person?.uuid && person?.role !== 'Citizen')
        .map((person: any) => ({ value: person.uuid, label: fullName(person) }))
}

/** The type a pre-selected recipient belongs to (e.g. "Write to" on an employee), or null when unknown. */
export function recipientTypeOf(uuid: string | null | undefined, citizens: RecipientOption[]): RecipientType | null {
    if (!uuid) return null
    return citizens.some((option) => option.value === uuid) ? 'citizens' : 'employees'
}
