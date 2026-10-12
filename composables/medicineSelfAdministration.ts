// Task #115: a self-administered medicine is taken by the citizen; staff only
// hand it out. Its doses are therefore logged as "delivered" (Udleveret), not
// "given" - unless the company has switched "delivered" off under the medicine
// form settings (FormFieldConfig citizen_medicine_history / status_types), in
// which case the backend would refuse it and "given" is used instead.
//
// Kept dependency-free (no vue / vue-i18n / Nuxt auto-imports), matching
// composables/medicinePnStatus.ts, so tests/unit/*.test.mjs can import this .ts
// file directly under `node --test` with no build step.

export type DoseType = 'given' | 'delivered' | 'deviated'

export function medicineSelfAdministration() {
    /** Whether the company's status settings allow "delivered" (allowed unless switched off). */
    function isDeliveredAllowed(statusTypeFields: Record<string, boolean> | null | undefined): boolean {
        return statusTypeFields?.delivered !== false
    }

    /** The status a new dose of this medicine starts on. */
    function defaultDoseType(
        medicine: { is_self_administered?: boolean | number | null } | null | undefined,
        statusTypeFields: Record<string, boolean> | null | undefined,
    ): DoseType {
        return medicine?.is_self_administered && isDeliveredAllowed(statusTypeFields) ? 'delivered' : 'given'
    }

    return { isDeliveredAllowed, defaultDoseType }
}
