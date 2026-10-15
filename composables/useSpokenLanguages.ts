import { useI18n } from 'vue-i18n'
import { spokenLanguageService } from '@/components/api/user/SpokenLanguageService'
import { sortByLabel, spokenLanguageName, spokenLanguageSummaryLine } from '@/composables/spokenLanguageNames'

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
        return spokenLanguageName(item, locale.value)
    }

    // Sorted by the name shown, so a Danish list is in Danish order whatever
    // order the server sent.
    function toOptions(items: SpokenLanguage[]) {
        return sortByLabel(items.map((item) => ({ value: item.uuid, label: labelFor(item) })), locale.value)
    }

    async function fetchAll(): Promise<SpokenLanguage[]> {
        const response = await spokenLanguageService.getSpokenLanguages()

        return response?.data ?? []
    }

    async function fetchOptions() {
        return toOptions(await fetchAll())
    }

    /**
     * Mother tongue first, then the rest, as one readable line: "Arabisk
     * (modersmål), Engelsk".
     */
    function summarise(items: SpokenLanguage[] | null | undefined, motherTongueLabel: string): string {
        return spokenLanguageSummaryLine(items, locale.value, motherTongueLabel)
    }

    return { labelFor, toOptions, fetchAll, fetchOptions, summarise }
}
