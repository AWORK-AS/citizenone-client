/**
 * AW-2026-6620 — an overnight shift is stored as one row per day (start/middle/end),
 * so clicking either half used to open just that half: 12:00 → 23:59 or 00:00 → 08:30.
 * Its locked midnight boundary then made 12:00 → 08:30 impossible to move to
 * 13:00 → 09:30 in one save.
 *
 * Load the whole shift's start and end instead and mark the edit, so the backend
 * rebuilds the night from both. If the lookup fails the half opens as before.
 */
export function useEntireShiftEdit() {
    async function withEntireShift(schedule: any, fetchShift: (uuid: string) => Promise<any>) {
        if (!schedule?.shift_span_position || schedule.shift_span_position === 'single') {
            return schedule
        }

        try {
            const response = await fetchShift(schedule.scheduleUuid)
            const start = response?.data?.span_date_time_start
            const end = response?.data?.span_date_time_end

            if (!start || !end) {
                return schedule
            }

            return { ...schedule, date_time_start: start, date_time_end: end, edit_entire_shift: true }
        } catch {
            return schedule
        }
    }

    return { withEntireShift }
}
