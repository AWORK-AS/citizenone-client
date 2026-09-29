// Extracted from the formerly-duplicated isMissed/isDueSoon/minutesSince/
// minutesUntil functions in pages/citizens/[uuid]/medicine-journals.vue and
// pages/citizens/[uuid]/children/[child_uuid]/medicine-journals.vue, and wired
// into both (as thin same-signature wrappers, so no call site needed to
// change) so the logic exists once and is unit tested (see
// tests/unit/medicineDoseTiming.test.mjs).
//
// FIX (2026-08-24): dosage times are picked from the platform-wide
// `time_intervals` catalog (backend `database/seeders/TimeIntervalSeeder.php`,
// no company scoping — every company sees the same list). Alongside 96
// quarter-hour point times, that seeder ships FIVE range windows, seeded for
// every company: "06:00 - 10:00", "10:00 - 13:00", "13:00 - 17:00",
// "17:00 - 22:00", and "22:00 - 06:00". The old code did
// `time.split(':').map(Number)`, which on a range string produces
// `[hours, NaN]` — `Date#setHours(hours, NaN, ...)` yields an invalid Date,
// and every comparison against it silently evaluated to false. So a
// range-scheduled dose could never register as overdue or due-soon anywhere
// that calls these functions — stats, alarm banners, and the "give all due"
// bulk action all under-counted as a result.
//
// Chosen semantic (a product call I made by default, not something confirmed
// with product/clinical staff — revisit if wrong): a range's deadline is its
// END time, treated like a point-time dose's only time. A window is "missed"
// once now is past its end, and "due soon" once its end is within the next
// 60 minutes — a dose given at any point while the window is open never
// trips isMissed at all, same as today.
//
// Overnight wrap: "22:00 - 06:00" has an end earlier than its start. The
// backend has NO midnight-crossing awareness at all (see
// BuildsDosageStatusByDate.php) — every schedule slot is repeated verbatim
// into every calendar date's bucket, with no special-casing for a range that
// crosses midnight. So "today's" bucket entry for this slot means exactly
// what a same-day reading of its two times implies: opens today evening,
// closes tomorrow morning. It is never "closes this morning" — that reading
// would only make sense if evaluating *yesterday's* bucket entry, which no
// call site does (every call site only ever looks at today's bucket). The
// deadline for a wrapped range is therefore always the next calendar day.
//
// This holds regardless of what time "now" currently is — including in the
// small hours, when it's tempting to think of the window as "already open
// and about to close". It isn't: today's date has already rolled over by
// then, so today's occurrence of an overnight slot has not started yet
// either way. (An earlier draft of this fix got exactly this wrong, treating
// the early-morning hours as inside an in-progress window and shifting the
// deadline conditionally — caught by a test with a 5am timestamp expecting
// "due soon", which turned out to be based on a scenario the app can't
// actually reach.)
//
// One real gap this does NOT close, and isn't in scope here: because the day
// view only ever renders dosage_status_by_date[todayStr], an overnight dose
// that opened yesterday evening and is still technically open past midnight
// has no visible representation once the calendar rolls over — it isn't in
// yesterday's view (no longer "today") and it isn't in today's slot either
// (which hasn't opened yet). Whether that's acceptable, or the day view
// needs to also surface yesterday's still-open overnight slot, is a product
// question about the single-date view model, not a parsing bug.
function resolveDeadline(time: string): { h: number; m: number; wrapsToNextDay: boolean } | null {
    const matches = time?.match(/\d{1,2}:\d{2}/g)
    if (!matches?.length) return null

    const last = matches[matches.length - 1]
    const [h, m] = last.split(':').map(Number)

    let wrapsToNextDay = false
    if (matches.length > 1) {
        const [startH, startM] = matches[0].split(':').map(Number)
        const endMinutes = h * 60 + m
        const startMinutes = startH * 60 + startM
        wrapsToNextDay = endMinutes <= startMinutes
    }

    return { h, m, wrapsToNextDay }
}

// Optional "YYYY-MM-DD" (a backend due-date bucket key) to anchor the slot to
// instead of today. The multi-day dashboard overview (AW-2026-6579) renders
// chips for past and future dates too; without this, every chip was judged
// against today's clock, so a past day's slot could read "not missed" and a
// future day's slot "due soon". Parsed as a LOCAL date — `new Date('2026-09-23')`
// would be UTC midnight and land on the previous day west of Greenwich.
function anchorDate(date: string | null | undefined, now: Date): Date {
    const match = date?.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!match) return new Date(now)
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

function scheduledFor(time: string, now: Date, date?: string | null): Date | null {
    const deadline = resolveDeadline(time)
    if (!deadline) return null

    // Always shift a wrapped range's deadline to the next calendar day,
    // unconditionally — see the header comment for why this doesn't depend
    // on what time "now" currently is.
    const scheduled = anchorDate(date, now)
    scheduled.setHours(deadline.h, deadline.m, 0, 0)
    if (deadline.wrapsToNextDay) {
        scheduled.setDate(scheduled.getDate() + 1)
    }
    return scheduled
}

export function medicineDoseTiming() {
    function isMissed(time: string, now: Date, date?: string | null): boolean {
        const scheduled = scheduledFor(time, now, date)
        if (!scheduled) return false
        return now > scheduled
    }

    function isDueSoon(time: string, now: Date, date?: string | null): boolean {
        const scheduled = scheduledFor(time, now, date)
        if (!scheduled) return false
        const diff = scheduled.getTime() - now.getTime()
        return diff > 0 && diff <= 60 * 60 * 1000
    }

    function minutesSince(time: string, now: Date): number {
        const scheduled = scheduledFor(time, now)
        if (!scheduled) return NaN
        return Math.round((now.getTime() - scheduled.getTime()) / 60000)
    }

    function minutesUntil(time: string, now: Date): number {
        const scheduled = scheduledFor(time, now)
        if (!scheduled) return NaN
        return Math.round((scheduled.getTime() - now.getTime()) / 60000)
    }

    return { isMissed, isDueSoon, minutesSince, minutesUntil }
}
