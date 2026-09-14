// AW-2026-3581 — PN (as-needed) dose limit checking.
//
// validateForm() in components/modules/user/citizen/medicine/history/form.vue
// used to compare computeAllEnteredQuantities() (a sum over
// state.formMedicineHistory.dosages, the SCHEDULED-slot array) against
// max_daily_dose for every save, including PN saves. PN medicine has no
// max_dosage_per_time, so that array is always empty and the sum is always 0
// — and max_daily_dose is a required field on every medicine card — so
// "0 !== max_daily_dose" was true on effectively every PN save. The
// confirmation dialog this drove fired unconditionally, with no numbers in
// it, training staff to reflex-click past it (and the real backend 4-hour
// minimum-interval warning that follows it, which looks identical).
//
// This composable is the fix: it looks at the dose the user actually typed
// (state.formMedicineHistory.dosage, singular) against the medicine's own
// limits, and only reports an excess when there genuinely is one.
//
// Kept dependency-free (no vue / vue-i18n / Nuxt auto-imports), matching
// composables/medicineDoseTiming.ts, so tests/unit/*.test.mjs can import this
// .ts file directly under `node --test` with no build step.

export function medicineDosage() {
    // Comma- or dot-decimal string -> a finite non-negative number, or NaN for
    // anything that isn't a clean decimal (letters, multiple separators, a
    // trailing separator, a negative sign, empty string).
    function parseDosage(value: any): number {
        const str = String(value ?? '').trim().replace(',', '.')
        if (!/^\d+(\.\d+)?$/.test(str)) return NaN
        return parseFloat(str)
    }

    function isValidDosage(value: any): boolean {
        const parsed = parseDosage(value)
        return Number.isFinite(parsed) && parsed > 0
    }

    // Returns which limit (if any) the entered dose exceeds, or null when the
    // dose is fine — including when there's nothing sensible to check against
    // (a missing, zero, or unparseable limit means "don't invent a warning").
    // max_dose_per_administration is checked first: it's the tighter,
    // PN-specific limit, and applies to this single dose alone.
    //
    // max_daily_dose is a CUMULATIVE cap on the whole day, not a per-dose one
    // -- three doses of 2 against a max of 6 should trip on the third, not
    // never. alreadyGivenToday (the medicine's given_today_total, minus the
    // being-edited record's own quantity when editing an entry from today --
    // see pnAlreadyGivenToday() in history/form.vue) plus the newly entered
    // dose is what actually gets compared to maxDaily. Caller passes 0 (the
    // default) when there's nothing reliable to add, e.g. backfilling a past
    // date, which degrades to the old single-dose-only comparison.
    function exceededDoseLimit(
        entered: any,
        limits: { maxPerAdministration?: any; maxDaily?: any; alreadyGivenToday?: any }
    ): { limit: 'max_dose_per_administration' | 'max_daily_dose'; entered: number; max: number; total?: number } | null {
        const enteredNumber = parseDosage(entered)
        if (!Number.isFinite(enteredNumber)) return null

        const maxPerAdministration = parseDosage(limits?.maxPerAdministration)
        if (Number.isFinite(maxPerAdministration) && maxPerAdministration > 0 && enteredNumber > maxPerAdministration) {
            return { limit: 'max_dose_per_administration', entered: enteredNumber, max: maxPerAdministration }
        }

        const maxDaily = parseDosage(limits?.maxDaily)
        if (Number.isFinite(maxDaily) && maxDaily > 0) {
            const alreadyGivenToday = Number(limits?.alreadyGivenToday ?? 0)
            const total = enteredNumber + (Number.isFinite(alreadyGivenToday) ? Math.max(0, alreadyGivenToday) : 0)
            if (total > maxDaily) {
                return { limit: 'max_daily_dose', entered: enteredNumber, max: maxDaily, total }
            }
        }

        return null
    }

    return { parseDosage, isValidDosage, exceededDoseLimit }
}
