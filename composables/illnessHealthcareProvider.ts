// AW-2026-3581 (2d): the "our contact person" checkbox on a citizen's
// illness/functional-impairment record used to default ON for every new
// record (derived from the free-text field being empty), switching in a
// dropdown that is a hard-required vuelidate field. When the citizen has no
// assigned employees -- and therefore no citizen_contacts row with
// title = 'our_contact_person' -- that dropdown has zero options, so the
// form is silently unsavable: vuelidate blocks the emit before any request
// goes out.
//
// These two pure decisions are pulled out of form.vue so the regression is
// checkable without a browser:
//   - contactPersonModeFor: whether a record should open with the
//     contact-person picker on, instead of free text.
//   - contactPersonOptions: building the picker's options, with the
//     employee-name fallback for contact rows that were edited into the
//     'our_contact_person' title without a name of their own.
//
// Kept dependency-free (no vue / vue-i18n / Nuxt auto-imports), matching
// composables/medicinePnStatus.ts, so tests/unit/*.test.mjs can import this
// .ts file directly under `node --test` with no build step.

export function illnessHealthcareProvider() {
    // A record opens in contact-person mode only when it actually has a
    // linked contact AND that contact is still selectable. Everything else
    // -- a brand-new record, a free-text record, or a record with neither
    // field set -- opens in free-text mode, so contact-person mode is
    // something the user opts into rather than a trap they have to opt out
    // of.
    function contactPersonModeFor(record: any, hasContactOptions: boolean): boolean {
        const linkedContactUuid = record?.healthcare?.uuid
        return typeof linkedContactUuid === 'string' && linkedContactUuid.length > 0 && hasContactOptions
    }

    // item.firstname/lastname is populated by the two automatic creation
    // paths (assigning an employee directly, or via an employee group), but
    // CitizenContactUpdateRequest only requires employee_uuid when a contact
    // is edited into the 'our_contact_person' title -- so a name is not
    // guaranteed on the contact row itself. Fall back to the linked
    // employee's name, and drop any row that would still render blank.
    function contactPersonOptions(rows: any[] | null | undefined): { value: any; label: string }[] {
        if (!Array.isArray(rows)) return []

        const options: { value: any; label: string }[] = []
        for (const item of rows) {
            if (!item?.uuid) continue

            const firstname = item?.firstname || item?.employee?.firstname || ''
            const lastname = item?.lastname || item?.employee?.lastname || ''
            const label = `${firstname} ${lastname}`.trim()
            if (!label) continue

            options.push({ value: item.uuid, label })
        }
        return options
    }

    return { contactPersonModeFor, contactPersonOptions }
}
