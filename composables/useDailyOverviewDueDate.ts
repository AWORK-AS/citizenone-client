import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

/**
 * Deadline badges for the Daily Overview's plans box: red once overdue, orange
 * within a week, grey further out, green when done.
 */
export function useDueDate() {
    const { t } = useI18n()
    const { formatDateToReadable } = useDatetimeFormatter()

    function daysUntil(date: string): number {
        return moment(date, 'YYYY-MM-DD').startOf('day').diff(moment().startOf('day'), 'days')
    }

    function dueBadge(date: string): string {
        const days = daysUntil(date)
        if (days < 0) return 'badge-red'
        if (days <= 7) return 'badge-orange'
        return 'badge-gray'
    }

    function dueLabel(date: string): string {
        const days = daysUntil(date)
        if (days < 0) return t('dailyOverviewLayouts.box.overdue', { date: formatDateToReadable(date) })
        if (days === 0) return t('dailyOverviewLayouts.box.dueToday')
        return formatDateToReadable(date)
    }

    function itemBadge(item: any): string {
        return item?.is_completed ? 'badge-green' : dueBadge(item?.completion_date)
    }

    function itemDate(item: any): string {
        return item?.is_completed ? t('plansandgoals.completed') : dueLabel(item?.completion_date)
    }

    return { dueBadge, dueLabel, itemBadge, itemDate }
}
