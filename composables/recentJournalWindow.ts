/**
 * The window the overview's recent journal notes feed opens on: the last N
 * days up to and including today, where N is seven unless asked otherwise.
 *
 * Kept free of moment and of Vue so the overview page, the feed component and
 * the "see all" link cannot drift apart on what "the last seven days" means,
 * and so it can be tested without a browser.
 */
export interface JournalWindow {
    start_date: string
    end_date: string
}

function toIsoDate(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')

    return `${date.getFullYear()}-${month}-${day}`
}

export function recentJournalWindow(days = 7, today: Date = new Date()): JournalWindow {
    // A one-day window is today alone, so the span reaches back days - 1.
    const span = Math.max(1, Math.trunc(days)) - 1
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - span)

    return {
        start_date: toIsoDate(start),
        end_date: toIsoDate(today),
    }
}
