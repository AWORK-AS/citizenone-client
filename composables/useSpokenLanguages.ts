import { useI18n } from 'vue-i18n'
import { spokenLanguageService } from '@/components/api/user/SpokenLanguageService'

export interface SpokenLanguage {
    uuid: string
    code: string
    name: string
    name_dk: string
    is_primary?: boolean
}

/**
 * The languages a citizen or an employee speaks.
 *
 * Distinct from the four UI locales in LanguageService: this is the reference
 * list of world languages used to record what someone actually speaks, so staff
 * know before a conversation whether they can be understood.
 */
export function useSpokenLanguages() {
    const { locale } = useI18n()

    /**
     * The list carries English and Danish names. Norwegian and Swedish users fall
     * back to the English name until those names are translated.
     */
    function labelFor(item: SpokenLanguage | null | undefined): string {
        if (!item) return ''
        return locale.value === 'dk' ? (item.name_dk || item.name) : item.name
    }

    function toOptions(items: SpokenLanguage[]) {
        return items.map((item) => ({ value: item.uuid, label: labelFor(item) }))
    }

    async function fetchOptions() {
        const response = await spokenLanguageService.getSpokenLanguages()
        const items: SpokenLanguage[] = response?.data ?? []
        return toOptions(items)
    }

    /**
     * Mother tongue first, then the rest, as one readable line: "Arabisk
     * (modersmål), Engelsk".
     */
    function summarise(items: SpokenLanguage[] | null | undefined, motherTongueLabel: string): string {
        if (!items?.length) return ''
        return items
            .map((item) => item.is_primary ? `${labelFor(item)} (${motherTongueLabel})` : labelFor(item))
            .join(', ')
    }

    return { labelFor, toOptions, fetchOptions, summarise }
}
