/**
 * Maps a reminder's snake_case `repeat` value (as stored on the backend) to its
 * camelCase i18n key under `reminders.form.repeat.*`, so lists and detail views
 * show the translated label instead of the raw enum value.
 */
import { useI18n } from 'vue-i18n'

export function useReminderRepeat() {
    const { t } = useI18n()

    const repeatKeyMap: Record<string, string> = {
        never: 'never',
        daily: 'daily',
        weekdays: 'weekdays',
        weekends: 'weekends',
        weekly: 'weekly',
        biweekly: 'biWeekly',
        monthly: 'monthly',
        every_three_months: 'everyThreeMonths',
        every_six_months: 'everySixMonths',
        yearly: 'yearly',
    }

    function repeatLabel(value?: string | null): string {
        if (!value) return ''
        const key = repeatKeyMap[value]
        return key ? t(`reminders.form.repeat.${key}`) : value
    }

    return { repeatLabel }
}
