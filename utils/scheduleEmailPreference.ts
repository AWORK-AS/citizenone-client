// AW-2026-10212: a planner's "Send email on changes" switch on the duty schedule.
// On by default (today's behaviour). Remembered per user in the browser, so one
// planner switching it off while planning ahead doesn't silence anyone else.
// Pure apart from the storage it is handed, so it can be tested on its own.

type ReadableStorage = { getItem(key: string): string | null }
type WritableStorage = { setItem(key: string, value: string): void }

const KEY = 'schedule_email_on_changes'

export function emailOnChangesKey(userId: string | null | undefined): string {
    return userId ? `${KEY}:${userId}` : KEY
}

/** On unless this user stored "off". Missing or blocked storage counts as on. */
export function readEmailOnChanges(storage: ReadableStorage | null | undefined, userId: string | null | undefined): boolean {
    try {
        return storage?.getItem(emailOnChangesKey(userId)) !== '0'
    } catch (e) {
        return true
    }
}

export function writeEmailOnChanges(storage: WritableStorage | null | undefined, userId: string | null | undefined, on: boolean): void {
    try {
        storage?.setItem(emailOnChangesKey(userId), on ? '1' : '0')
    } catch (e) { /* blocked storage: the switch still works until the page reloads */ }
}
