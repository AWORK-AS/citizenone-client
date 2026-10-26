/**
 * Pure helpers for the hour type on a hand-made time registration
 * (Indsatstimer): visit (Kontakttimer (ATA)), transport, administration, or a
 * type the company added. Free of Vue and auto-imports so they can be tested
 * with `node --test tests/unit/careHourTypes.test.mjs`.
 */

export type CareHourType = { uuid: string, name: string, system_key: string | null }

/**
 * The company switch "Choose an hour type on intervention hours", off unless
 * an Admin turned it on in Settings. A company without the field (an older
 * payload) counts as off.
 */
export function isCareHourTypesOn(company: any): boolean {
    return company?.care_hour_types_enabled === true
}

/**
 * The picker's options: the company's active types, plus the row's own type
 * if it was made inactive since, so editing an older row still shows it.
 */
export function hourTypeChoices(types: CareHourType[], current?: { uuid?: string, name?: string } | null): { value: string, label: string }[] {
    const choices = (types ?? []).map((type) => ({ value: type.uuid, label: type.name }))

    if (current?.uuid && !choices.some((choice) => choice.value === current.uuid)) {
        choices.push({ value: current.uuid, label: current.name ?? '' })
    }

    return choices
}

/**
 * Where a new registration starts: contact time (Kontakttimer (ATA)) when the
 * company has it, else its first type, else none.
 */
export function defaultHourTypeUuid(types: CareHourType[]): string {
    return ((types ?? []).find((type) => type.system_key === 'contact') ?? (types ?? [])[0])?.uuid ?? ''
}

/**
 * The type a further line on a journal note starts from. The first line is
 * the visit; the one after it is usually the admin around it, so it starts
 * as administration when the company has that type, else as the default.
 */
export function extraLineHourTypeUuid(types: CareHourType[]): string {
    return (types ?? []).find((type) => type.system_key === 'admin')?.uuid ?? defaultHourTypeUuid(types)
}

/**
 * What a save adds for the type: only a chosen one, and only when the picker
 * showed. Left out, the server saves a new row without a type and leaves an
 * edited row's type alone, exactly as before.
 */
export function hourTypePayload(shown: boolean, uuid: string | null | undefined): { contract_hour_type_uuid?: string } {
    return shown && uuid ? { contract_hour_type_uuid: uuid } : {}
}

/**
 * The hour types offered at check-in. A drive has its own button when the
 * person registers transport, so the transport type is left out there.
 */
export function checkInHourTypeChoices(types: CareHourType[], transportHasOwnButton: boolean): CareHourType[] {
    return (types ?? []).filter((type) => !(transportHasOwnButton && type.system_key === 'transport'))
}
