import moment from 'moment'

/**
 * Compact relative time for chat-history-style lists ("1m", "4h", "9d") -
 * distinct from useDatetimeFormatter's full localized dates, which are too
 * wide for a narrow sidebar/list row.
 */
export function useCompactRelativeTime() {
    function formatCompactRelativeTime(date: string): string {
        const then = moment(date)
        const minutes = moment().diff(then, 'minutes')

        if (minutes < 1) return 'now'
        if (minutes < 60) return `${minutes}m`

        const hours = moment().diff(then, 'hours')
        if (hours < 24) return `${hours}h`

        const days = moment().diff(then, 'days')
        return `${days}d`
    }

    return { formatCompactRelativeTime }
}
