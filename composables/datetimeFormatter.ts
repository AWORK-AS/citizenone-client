import moment from 'moment'
import { useI18n } from "vue-i18n"

export function useDatetimeFormatter() {
    const { t, locale } = useI18n()

    function formatDateToReadable(date: string): string {
        const monthNumber = parseInt(moment(date).format('M'))
        if (monthNumber === 1) {
            return `${moment(date).format('DD.')} ${t('calendar.month.January').toLowerCase()} ${moment(date).format('YYYY')}`
        } else if (monthNumber === 2) {
            return `${moment(date).format('DD.')} ${t('calendar.month.February').toLowerCase()} ${moment(date).format('YYYY')}`
        } else if (monthNumber === 3) {
            return `${moment(date).format('DD.')} ${t('calendar.month.March').toLowerCase()} ${moment(date).format('YYYY')}`
        } else if (monthNumber === 4) {
            return `${moment(date).format('DD.')} ${t('calendar.month.April').toLowerCase()} ${moment(date).format('YYYY')}`
        } else if (monthNumber === 5) {
            return `${moment(date).format('DD.')} ${t('calendar.month.May').toLowerCase()} ${moment(date).format('YYYY')}`
        } else if (monthNumber === 6) {
            return `${moment(date).format('DD.')} ${t('calendar.month.June').toLowerCase()} ${moment(date).format('YYYY')}`
        } else if (monthNumber === 7) {
            return `${moment(date).format('DD.')} ${t('calendar.month.July').toLowerCase()} ${moment(date).format('YYYY')}`
        } else if (monthNumber === 8) {
            return `${moment(date).format('DD.')} ${t('calendar.month.August').toLowerCase()} ${moment(date).format('YYYY')}`
        } else if (monthNumber === 9) {
            return `${moment(date).format('DD.')} ${t('calendar.month.September').toLowerCase()} ${moment(date).format('YYYY')}`
        } else if (monthNumber === 10) {
            return `${moment(date).format('DD.')} ${t('calendar.month.October').toLowerCase()} ${moment(date).format('YYYY')}`
        } else if (monthNumber === 11) {
            return `${moment(date).format('DD.')} ${t('calendar.month.November').toLowerCase()} ${moment(date).format('YYYY')}`
        } else {
            return `${moment(date).format('DD.')} ${t('calendar.month.December').toLowerCase()} ${moment(date).format('YYYY')}`
        }
    }

    function formatDateTimeToReadable(datetime: string): string {
        const monthNumber = parseInt(moment(datetime).format('M'))
        if (monthNumber === 1) {
            return `${moment(datetime).format('DD.')} ${t('calendar.month.January').toLowerCase()} ${moment(datetime).format('YYYY, HH:mm')}`
        } else if (monthNumber === 2) {
            return `${moment(datetime).format('DD.')} ${t('calendar.month.February').toLowerCase()} ${moment(datetime).format('YYYY, HH:mm')}`
        } else if (monthNumber === 3) {
            return `${moment(datetime).format('DD.')} ${t('calendar.month.March').toLowerCase()} ${moment(datetime).format('YYYY, HH:mm')}`
        } else if (monthNumber === 4) {
            return `${moment(datetime).format('DD.')} ${t('calendar.month.April').toLowerCase()} ${moment(datetime).format('YYYY, HH:mm')}`
        } else if (monthNumber === 5) {
            return `${moment(datetime).format('DD.')} ${t('calendar.month.May').toLowerCase()} ${moment(datetime).format('YYYY, HH:mm')}`
        } else if (monthNumber === 6) {
            return `${moment(datetime).format('DD.')} ${t('calendar.month.June').toLowerCase()} ${moment(datetime).format('YYYY, HH:mm')}`
        } else if (monthNumber === 7) {
            return `${moment(datetime).format('DD.')} ${t('calendar.month.July').toLowerCase()} ${moment(datetime).format('YYYY, HH:mm')}`
        } else if (monthNumber === 8) {
            return `${moment(datetime).format('DD.')} ${t('calendar.month.August').toLowerCase()} ${moment(datetime).format('YYYY, HH:mm')}`
        } else if (monthNumber === 9) {
            return `${moment(datetime).format('DD.')} ${t('calendar.month.September').toLowerCase()} ${moment(datetime).format('YYYY, HH:mm')}`
        } else if (monthNumber === 10) {
            return `${moment(datetime).format('DD.')} ${t('calendar.month.October').toLowerCase()} ${moment(datetime).format('YYYY, HH:mm')}`
        } else if (monthNumber === 11) {
            return `${moment(datetime).format('DD.')} ${t('calendar.month.November').toLowerCase()} ${moment(datetime).format('YYYY, HH:mm')}`
        } else {
            return `${moment(datetime).format('DD.')} ${t('calendar.month.December').toLowerCase()} ${moment(datetime).format('YYYY, HH:mm')}`
        }
    }

    function formatTimeToReadable(time: string) {
        return moment(time).format('HH:mm');
    }

    function formatDateWithWeekdayToReadable(date: string): string {
        const weekday = t(`calendar.days.${moment(date).format('dddd')}`)

        return `${weekday}, ${formatDateToReadable(date)}`
    }

    /**
     * `moment(date).format(pattern)`, with month and weekday names in the
     * interface language. moment's own locale files are not reliably bundled,
     * so `format('MMMM')` printed English names in a Danish interface. The
     * names come from `calendar.month.*` / `calendar.days.*` instead and are
     * handed to moment as bracketed literals; MMM and ddd are the first three
     * letters. Nordic month and day names are lowercase mid-sentence, so only
     * a name that opens the result is capitalised.
     */
    function formatLocalized(date: moment.MomentInput, pattern: string): string {
        const m = moment(date)
        if (!m.isValid()) return ''
        if (locale.value === 'en') return m.clone().locale('en').format(pattern)

        const english = m.clone().locale('en')
        const month = t(`calendar.month.${english.format('MMMM')}`).toLowerCase()
        const day = t(`calendar.days.${english.format('dddd')}`).toLowerCase()
        const names: Record<string, string> = { MMMM: month, MMM: month.slice(0, 3), dddd: day, ddd: day.slice(0, 3) }

        // Leave text the caller already bracketed alone.
        const escaped = pattern
            .split(/(\[[^\]]*\])/)
            .map((part) => part.startsWith('[') ? part : part.replace(/MMMM|MMM|dddd|ddd/g, (token) => `[${names[token]}]`))
            .join('')
        const out = m.format(escaped)

        return out.charAt(0).toUpperCase() + out.slice(1)
    }

    return { formatDateToReadable, formatDateTimeToReadable, formatTimeToReadable, formatDateWithWeekdayToReadable, formatLocalized }
}