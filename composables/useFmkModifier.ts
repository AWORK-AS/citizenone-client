import { useI18n } from 'vue-i18n'
import { fmkModificator, fmkOrganisation, fmkText } from '@/utils/fmk'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

/**
 * How the FMK screen shows who did something on FMK (modifikator, GK 3.6 /
 * 3.5.5-3.5.10 / 3.7.1): name with authorisation code, organisation with its
 * identifier (SKS/SOR/yder) and phone, then date and time. The same wording
 * everywhere: card markings, rows and the details window.
 */
export function useFmkModifier() {
    const { t } = useI18n()
    const { formatDateTimeToReadable } = useDatetimeFormatter()

    function organisationLine(org: any): string {
        const o = fmkOrganisation(org)
        return [o.name, o.identifier && `(${o.identifier})`, o.phone && t('fmk.status.phone', { phone: o.phone })].filter(Boolean).join(' ')
    }

    function by(entry: any): string {
        const m = fmkModificator(entry?.By)
        const person = m.who && m.authorisation ? t('fmk.status.withAuthorisation', { name: m.who, code: m.authorisation }) : m.who
        const org = organisationLine(entry?.By?.Organisation ?? entry?.By?.AuthorisedHealthcareProfessional?.Organisation ?? entry?.By?.Other?.Organisation)
        const who = m.isPatient ? t('fmk.status.byPatient') : [person, org].filter(Boolean).join(', ')
        const when = entry?.DateTime ? formatDateTimeToReadable(fmkText(entry.DateTime) ?? '') : ''
        return [who, when].filter(Boolean).join(' · ')
    }

    return { by, organisationLine }
}
