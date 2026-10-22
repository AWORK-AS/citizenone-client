// Task #6: "Duty schedule must show the load of each day".
//
// The backend sends, per day in week_data / month_data, a `load` object counted
// over every employee (not just the page of rows on screen):
//   staff_count   distinct employees with a working shift
//   shift_count   working shifts
//   planned_hours their length
//   absent_count  employees on an absence type and not working
//   minimum_staff the departments' "Minimumsbemanding", or null when none is set
//
// Kept dependency-free (no vue / vue-i18n / Nuxt auto-imports), matching
// composables/medicinePnStatus.ts, so tests/unit/*.test.mjs can import this .ts
// file directly under `node --test` with no build step.

export type DayLoad = {
    staff_count: number
    shift_count: number
    planned_hours: number
    absent_count: number
    minimum_staff: number | null
}

/** `under` below the minimum, `met` at or above it, `none` when no minimum is set or no data. */
export type DayLoadStatus = 'under' | 'met' | 'none'

export function dutyDayLoad() {
    function loadStatus(load: DayLoad | null | undefined): DayLoadStatus {
        if (!load || load.minimum_staff === null || load.minimum_staff === undefined || load.minimum_staff <= 0) {
            return 'none'
        }
        return load.staff_count < load.minimum_staff ? 'under' : 'met'
    }

    /** How many more are needed to reach the minimum (0 when met or no minimum). */
    function missingStaff(load: DayLoad | null | undefined): number {
        if (loadStatus(load) !== 'under') return 0
        return (load!.minimum_staff as number) - load!.staff_count
    }

    /**
     * Hours as a short figure: 7.5 → "7,5" (dk) / "7.5" (en), whole hours without decimals.
     * Two decimals at most, so quarter hours stay exact: 8.75 must not show as 8.8, or the
     * day totals no longer add up to the shifts they are made of.
     */
    function formatHours(hours: number | null | undefined, locale = 'da-DK'): string {
        const value = Number(hours ?? 0)
        return value.toLocaleString(locale, { maximumFractionDigits: 2 })
    }

    return { loadStatus, missingStaff, formatHours }
}
