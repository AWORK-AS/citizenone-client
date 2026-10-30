/**
 * The reminder before a calendar event: minutes before it starts, as the
 * backend accepts them (App\Support\CalendarReminders). null is no reminder,
 * 0 is when it starts.
 */
export const CALENDAR_REMINDER_OPTIONS = [0, 5, 10, 15, 30, 60, 120, 1440, 2880] as const

/** What a new event starts with. */
export const DEFAULT_CALENDAR_REMINDER = 15

/** The select can't hold null, so "no reminder" has a value of its own. */
export const NO_CALENDAR_REMINDER = 'none'

/**
 * The stored reminder of an event being edited. An event saved before
 * reminders existed has none, and keeps none until someone picks one.
 */
export function reminderOf(event: any): number | null {
    const minutes = event?.reminder_minutes
    if (minutes === null || minutes === undefined || minutes === '') return null
    const value = Number(minutes)
    return (CALENDAR_REMINDER_OPTIONS as readonly number[]).includes(value) ? value : null
}

/** The translation key and count for one choice, e.g. "15 minutes before". */
export function reminderLabel(minutes: number | null): { key: string, count?: number } {
    if (minutes === null) return { key: 'events.form.reminder.none' }
    if (minutes === 0) return { key: 'events.form.reminder.atStart' }
    if (minutes % 1440 === 0) return { key: 'events.form.reminder.daysBefore', count: minutes / 1440 }
    if (minutes % 60 === 0) return { key: 'events.form.reminder.hoursBefore', count: minutes / 60 }
    return { key: 'events.form.reminder.minutesBefore', count: minutes }
}
