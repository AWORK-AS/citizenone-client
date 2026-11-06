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

/** One hour line on a journal note, as the form edits it ('HH:mm' times). */
export type CareHoursLine = { key: number, start: string, end: string, type: string }

/**
 * The care_hours a new note sends, and the keys of the lines in the order sent.
 * An empty line is left out, as the single line was before; one with only a
 * time is sent, so the server says what is missing. The keys map the server's
 * care_hours.{n}.* errors back to the line they are about.
 */
export function journalCareHoursRequest(lines: CareHoursLine[], date: string, typesShown: boolean): { lines: Record<string, string>[], keys: number[] } {
    const sent = (lines ?? []).filter((line) => line.start || line.end)

    return {
        lines: sent.map((line) => ({
            date_time_start: `${date} ${line.start}`,
            date_time_end: `${date} ${line.end}`,
            ...hourTypePayload(typesShown, line.type),
        })),
        keys: sent.map((line) => line.key),
    }
}

/**
 * Whether the first line should take the visit's new time: when it is still
 * empty, or still holds the visit's previous time. A time someone typed is
 * left alone.
 */
export function firstLineTakesVisit(first: { start: string, end: string } | undefined, before: { start: string, end: string } | null): boolean {
    if (!first) return false
    if (!first.start && !first.end) return true

    return !!before && first.start === before.start && first.end === before.end
}

/** A further line starts where the last one ended. */
export function nextLineStart(lines: { end: string }[]): string {
    return (lines ?? [])[(lines ?? []).length - 1]?.end ?? ''
}


/**
 * One hour line already on a journal note, as its edit form changes it. The
 * date is per line: lines registered with a note can lie on different days.
 */
export type NoteCareHoursLine = {
    key: number
    uuid: string | null
    date: string
    start: string
    end: string
    type: string
    /** Removed when the hours are saved. */
    removed: boolean
    /** In a month closed for payroll: shown, never sent. */
    paidOut: boolean
    original: { date: string, start: string, end: string, type: string } | null
}

/** A line as the server sends it (GET /citizen-journals/{uuid}/care-hours). */
export function noteCareHoursLine(key: number, row: any): NoteCareHoursLine {
    const [date = '', startTime = ''] = String(row?.date_time_start ?? '').split(/[ T]/)
    const [, endTime = ''] = String(row?.date_time_end ?? '').split(/[ T]/)
    const values = { date, start: startTime.slice(0, 5), end: endTime.slice(0, 5), type: row?.contract_hour_type_uuid ?? '' }

    return { key, uuid: row?.uuid ?? null, ...values, removed: false, paidOut: row?.is_paid_out === true, original: { ...values } }
}

/** Whether a stored line was changed in the form. */
export function noteCareHoursLineChanged(line: NoteCareHoursLine, typesShown: boolean): boolean {
    if (!line.original) return true
    const o = line.original

    return line.date !== o.date || line.start !== o.start || line.end !== o.end || (typesShown && line.type !== o.type)
}

/**
 * What saving the hours of an existing note sends: only changed and new lines
 * (an empty new line is left out), and the uuids of removed ones. Paid-out
 * lines are never sent. The keys map the server's care_hours.{n}.* and
 * remove_care_hour_uuids.{n} errors back to their lines.
 */
export function journalCareHoursEditRequest(lines: NoteCareHoursLine[], typesShown: boolean): {
    care_hours: Record<string, string>[], remove_care_hour_uuids: string[], keys: number[], removeKeys: number[]
} {
    const sent = (lines ?? []).filter((line) => !line.paidOut && !line.removed
        && (line.uuid ? noteCareHoursLineChanged(line, typesShown) : !!(line.start || line.end)))
    const removed = (lines ?? []).filter((line) => !line.paidOut && line.removed && line.uuid)

    return {
        care_hours: sent.map((line) => ({
            ...(line.uuid ? { uuid: line.uuid } : {}),
            date_time_start: `${line.date} ${line.start}`,
            date_time_end: `${line.date} ${line.end}`,
            ...hourTypePayload(typesShown, line.type),
        })),
        remove_care_hour_uuids: removed.map((line) => line.uuid as string),
        keys: sent.map((line) => line.key),
        removeKeys: removed.map((line) => line.key),
    }
}
