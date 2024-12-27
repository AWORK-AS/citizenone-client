import moment from 'moment'
import { useI18n } from "vue-i18n"

export function useDatetimeFormatter() {
    const { t } = useI18n()

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

    return { formatDateToReadable, formatDateTimeToReadable, formatTimeToReadable }
}