/**
 * Pure helpers for the Info Screen display (pages/screen.vue): what is on now
 * and next, where things sit on the day's timeline, the weather curve and the
 * poll's shares. No Nuxt imports, so they run under node --test.
 */

export interface ScreenActivity {
    time: string | null
    title: string
    icon?: string | null
}

export type ActivityState = 'past' | 'now' | 'next' | 'later'

export interface ActivityWithState extends ScreenActivity {
    state: ActivityState
    minutes: number | null
    minutesUntil: number | null
}

/** How long an activity counts as "now" at most, also the last of the day. */
export const LAST_ACTIVITY_MINUTES = 90

export function toMinutes(time: string | null | undefined): number | null {
    if (!time) return null
    const match = /^(\d{1,2}):(\d{2})$/.exec(time)
    if (!match) return null
    return Number(match[1]) * 60 + Number(match[2])
}

/**
 * Each activity marked past, now, next or later at `nowMinutes` (minutes since
 * midnight). An activity is "now" from its start until the next one starts,
 * for LAST_ACTIVITY_MINUTES at most.
 * Activities without a time are listed last and never marked.
 */
export function activityStates(activities: ScreenActivity[], nowMinutes: number): ActivityWithState[] {
    const timed = activities
        .map((activity) => ({ ...activity, minutes: toMinutes(activity.time) }))
        .filter((activity) => activity.minutes !== null)
        .sort((a, b) => (a.minutes as number) - (b.minutes as number))
    const untimed = activities.filter((activity) => toMinutes(activity.time) === null)

    let nextFound: number | false = false
    const marked = timed.map((activity, index) => {
        const start = activity.minutes as number
        // Activities sharing a start time run together, so the next one is the first later start.
        // A morning activity is not "now" all afternoon: it ends after LAST_ACTIVITY_MINUTES at most.
        const nextStart = Math.min(
            (timed.slice(index + 1).find((other) => (other.minutes as number) > start)?.minutes as number | undefined) ?? Infinity,
            start + LAST_ACTIVITY_MINUTES,
        )
        let state: ActivityState = 'later'
        if (nowMinutes >= nextStart) state = 'past'
        else if (nowMinutes >= start) state = 'now'
        else if (nextFound === false || nextFound === start) {
            state = 'next'
            nextFound = start
        }
        return { ...activity, state, minutesUntil: start > nowMinutes ? start - nowMinutes : null }
    })

    return [
        ...marked,
        ...untimed.map((activity) => ({ ...activity, state: 'later' as ActivityState, minutes: null, minutesUntil: null })),
    ]
}

/** The hours the day's timeline spans: at least 07-22, wider if the program is, never past midnight. */
export function timelineRange(activities: ScreenActivity[]): { start: number; end: number } {
    const minutes = activities.map((activity) => toMinutes(activity.time)).filter((m): m is number => m !== null)
    const earliest = minutes.length ? Math.min(...minutes) : 7 * 60
    const latest = minutes.length ? Math.max(...minutes) : 22 * 60
    return {
        start: Math.min(7 * 60, Math.floor(earliest / 60) * 60),
        end: Math.min(24 * 60, Math.max(22 * 60, Math.ceil((latest + 60) / 60) * 60)),
    }
}

/** Where `minutes` sits on the range, 0-100, clamped. */
export function timelinePercent(minutes: number, range: { start: number; end: number }): number {
    const percent = ((minutes - range.start) / (range.end - range.start)) * 100
    return Math.min(100, Math.max(0, percent))
}

/** MET Norway symbol codes (e.g. "partlycloudy_day") to Phosphor icons. */
export function weatherIcon(symbol: string | null | undefined): string {
    if (!symbol) return 'ph:thermometer-simple'
    const night = symbol.endsWith('_night') || symbol.endsWith('_polartwilight')
    const base = symbol.replace(/_(day|night|polartwilight)$/, '')
    if (base.includes('thunder')) return 'ph:cloud-lightning'
    if (base.includes('snow')) return 'ph:snowflake'
    if (base.includes('sleet')) return 'ph:cloud-snow'
    if (base.includes('rain')) return 'ph:cloud-rain'
    if (base === 'fog') return 'ph:cloud-fog'
    if (base === 'cloudy') return 'ph:cloud'
    if (base === 'partlycloudy' || base === 'fair') return night ? 'ph:cloud-moon' : 'ph:cloud-sun'
    if (base === 'clearsky') return night ? 'ph:moon-stars' : 'ph:sun'
    return 'ph:cloud'
}

export interface WeatherHour {
    time: string
    temperature: number
    symbol: string | null
}

export interface CurvePoint extends WeatherHour {
    x: number
    y: number
}

/**
 * The temperature curve as SVG paths in a width x height box: a smooth line
 * (Catmull-Rom turned into cubic Béziers) and the area under it. The y-scale
 * gets 2 degrees of headroom so a flat day does not look dramatic.
 */
export function weatherCurve(hours: WeatherHour[], width: number, height: number, padX = 24, padY = 28) {
    if (hours.length < 2) return { line: '', area: '', points: [] as CurvePoint[], min: null, max: null }

    const temps = hours.map((hour) => hour.temperature)
    const min = Math.min(...temps)
    const max = Math.max(...temps)
    const low = min - 2
    const high = max + 2
    const stepX = (width - padX * 2) / (hours.length - 1)

    const points: CurvePoint[] = hours.map((hour, index) => ({
        ...hour,
        x: padX + index * stepX,
        y: padY + (1 - (hour.temperature - low) / (high - low)) * (height - padY * 2),
    }))

    let line = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] ?? points[i]
        const p1 = points[i]
        const p2 = points[i + 1]
        const p3 = points[i + 2] ?? p2
        const c1x = p1.x + (p2.x - p0.x) / 6
        const c1y = p1.y + (p2.y - p0.y) / 6
        const c2x = p2.x - (p3.x - p1.x) / 6
        const c2y = p2.y - (p3.y - p1.y) / 6
        line += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
    }
    const last = points[points.length - 1]
    const area = `${line} L ${last.x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`

    return { line, area, points, min, max }
}

/**
 * Whole-number percentages of a poll's votes that add up to 100 (largest
 * remainder), so three equal options read 34/33/33, not 33/33/33. Zero votes
 * gives zeros, not NaN.
 */
export function pollShares(options: { title: string; votes: number }[]): number[] {
    const total = options.reduce((sum, option) => sum + option.votes, 0)
    if (!total) return options.map(() => 0)

    const exact = options.map((option) => (option.votes / total) * 100)
    const shares = exact.map(Math.floor)
    let left = 100 - shares.reduce((sum, share) => sum + share, 0)
    exact
        .map((value, index) => ({ index, rest: value - shares[index] }))
        .sort((a, b) => b.rest - a.rest || a.index - b.index)
        .forEach(({ index }) => {
            if (left > 0) {
                shares[index]++
                left--
            }
        })
    return shares
}

/**
 * Pictograms for activities, for residents who do not read. The keys are what
 * the API stores (InfoScreen::ACTIVITY_ICONS); keep the two lists the same.
 */
export const ACTIVITY_ICONS: Record<string, string> = {
    meal: 'ph:fork-knife',
    coffee: 'ph:coffee',
    walk: 'ph:person-simple-walk',
    bus: 'ph:bus',
    workshop: 'ph:hammer',
    music: 'ph:music-notes',
    sport: 'ph:soccer-ball',
    bath: 'ph:bathtub',
    doctor: 'ph:stethoscope',
    medicine: 'ph:pill',
    hairdresser: 'ph:scissors',
    shopping: 'ph:shopping-cart',
    cleaning: 'ph:broom',
    cinema: 'ph:film-slate',
    games: 'ph:puzzle-piece',
    party: 'ph:confetti',
    church: 'ph:church',
    garden: 'ph:plant',
    visit: 'ph:users',
    sleep: 'ph:moon',
}

export function activityIcon(key: string | null | undefined): string | null {
    return (key && ACTIVITY_ICONS[key]) || null
}

/** Whether `nowMinutes` falls in the night from `from` to `to`; the night may cross midnight. */
export function isNightTime(nowMinutes: number, from: string | null | undefined, to: string | null | undefined): boolean {
    const start = toMinutes(from)
    const end = toMinutes(to)
    if (start === null || end === null || start === end) return false
    return start < end
        ? nowMinutes >= start && nowMinutes < end
        : nowMinutes >= start || nowMinutes < end
}

/**
 * A paired screen asks for content every minute and is marked seen at most
 * every 5 minutes, so 15 minutes without a sign means it is off or offline.
 */
export const OFFLINE_AFTER_MINUTES = 15

export function isOffline(screen: { is_paired: boolean; last_seen_at: string | null }, now: number = Date.now()): boolean {
    if (!screen.is_paired) return false
    if (!screen.last_seen_at) return true
    return now - Date.parse(screen.last_seen_at) > OFFLINE_AFTER_MINUTES * 60_000
}

/**
 * Milliseconds until the screen reloads itself: 04:00 local time, plus a
 * jitter so a company's screens do not all ask at the same second. A TV can
 * run for weeks; the reload brings in new versions and frees memory.
 */
export const RELOAD_HOUR = 4

export function msUntilNextReload(now: Date, jitterMs: number): number {
    const next = new Date(now)
    next.setHours(RELOAD_HOUR, 0, 0, 0)
    if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1)
    return next.getTime() - now.getTime() + jitterMs
}

export interface WeekdayActivity extends ScreenActivity {
    weekday: number
}

/**
 * The program with one day's activities copied to other days, replacing what
 * those days had. Rows without a title are not copied. Sorted by day and time.
 */
export function copyDayProgram<T extends WeekdayActivity>(activities: T[], from: number, targets: number[]): T[] {
    const days = targets.filter((day) => day !== from)
    const source = activities.filter((row) => row.weekday === from && row.title?.trim())
    return [
        ...activities.filter((row) => !days.includes(row.weekday)),
        ...days.flatMap((day) => source.map((row) => ({ ...row, weekday: day }))),
    ].sort((a, b) => a.weekday - b.weekday || String(a.time ?? '').localeCompare(String(b.time ?? '')))
}

export interface Reminder {
    activity: ScreenActivity
    minutesLeft: number
}

/**
 * The activity starting within `minutes` of `nowMinutes`, soonest first, for
 * the full-screen "In 10 min: Walk" reminder. Null when none, or when off (0).
 */
export function upcomingReminder(activities: ScreenActivity[], nowMinutes: number, minutes: number): Reminder | null {
    if (!minutes || minutes <= 0) return null
    let best: Reminder | null = null
    for (const activity of activities) {
        const start = toMinutes(activity.time)
        if (start === null) continue
        const left = start - nowMinutes
        if (left < 0 || left > minutes) continue
        if (!best || left < best.minutesLeft) best = { activity, minutesLeft: left }
    }
    return best
}

/**
 * The reminder takes the screen this many seconds of each minute, so the rest
 * of the screen (and the clock) is still seen in between.
 */
export const REMINDER_SHOW_SECONDS = 25

export function reminderShowing(secondOfMinute: number): boolean {
    return secondOfMinute < REMINDER_SHOW_SECONDS
}

/** One or two letters for a staff member without a photo. */
export function initials(name: string | null | undefined): string {
    const parts = String(name ?? '').trim().split(/[\s-]+/).filter(Boolean)
    return parts.slice(0, 2).map((part) => part[0].toLocaleUpperCase()).join('')
}

/** Mood answers: 1 sad, 2 so-so, 3 happy. Shares sum to 100, like the poll's. */
export const MOODS = [1, 2, 3] as const

export function moodShares(counts: number[] | null | undefined): number[] {
    return pollShares((counts ?? [0, 0, 0]).map((votes) => ({ title: '', votes })))
}
