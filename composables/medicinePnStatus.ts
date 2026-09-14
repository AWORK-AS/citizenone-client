// AW-2026-3581 backend follow-up: PN medicine's row used to read
// medicine.last_given_minutes_ago for its "wait N more" badge -- a field
// that never existed anywhere in the API, so the badge never rendered. The
// backend now exposes the real fields instead: last_given_at (an ISO8601
// timestamp, or null if no dose has ever been logged) and
// pn_minimum_interval_minutes (the same PN_MINIMUM_INTERVAL_MINUTES the
// backend itself enforces, so the frontend no longer hardcodes 240). This
// composable derives "minutes since last dose" / "minutes remaining in the
// interval" from those two real fields.
//
// Kept dependency-free (no vue / vue-i18n / Nuxt auto-imports), matching
// composables/medicineDoseTiming.ts, so tests/unit/*.test.mjs can import
// this .ts file directly under `node --test` with no build step.

export function medicinePnStatus() {
    function minutesSinceLastGiven(lastGivenAt: string | null | undefined, now: Date): number | null {
        if (!lastGivenAt) return null
        const given = new Date(lastGivenAt)
        if (Number.isNaN(given.getTime())) return null
        return Math.max(0, Math.round((now.getTime() - given.getTime()) / 60000))
    }

    // null means "nothing to warn about": no dose has ever been logged, or
    // the interval has already fully elapsed since the last one.
    function minutesRemainingInInterval(
        lastGivenAt: string | null | undefined,
        intervalMinutes: number | null | undefined,
        now: Date
    ): number | null {
        const since = minutesSinceLastGiven(lastGivenAt, now)
        if (since === null) return null

        const interval = Number(intervalMinutes)
        if (!Number.isFinite(interval) || interval <= 0) return null

        const remaining = interval - since
        return remaining > 0 ? remaining : null
    }

    return { minutesSinceLastGiven, minutesRemainingInInterval }
}
