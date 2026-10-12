import BaseAPIService from '@/components/api/BaseAPIService'
import { useI18n } from 'vue-i18n'

/**
 * The company's gender list for dropdowns and labels.
 *
 * The built-in genders (male, female, non_binary, will_not_disclose) are
 * stored by key and translated here; a gender the company added is stored and
 * shown by its own name. Typing a new one in a dropdown that allows it adds it
 * to the list when the citizen or child is saved.
 */
const DEFAULT_LABEL_KEYS: Record<string, string> = {
    male: 'gender.male',
    female: 'gender.female',
    non_binary: 'gender.nonbinary',
    will_not_disclose: 'gender.willNotDisclose',
}

class CitizenGenderService extends BaseAPIService {
    async getGenders(): Promise<any> {
        return await this.request('/user/citizen-genders', 'GET')
    }
}

const citizenGenderService = new CitizenGenderService()

// One list per page load, shared by every dropdown that asks for it.
const values = ref<string[]>([])
let loading: Promise<void> | null = null

export function useGenders() {
    const { t } = useI18n()

    function load(force = false): Promise<void> {
        if (!loading || force) {
            loading = citizenGenderService.getGenders()
                .then((response: any) => {
                    values.value = (response?.data ?? []).map((gender: any) => gender.value)
                })
                .catch(() => {
                    // Without the list the built-in genders still work.
                    values.value = Object.keys(DEFAULT_LABEL_KEYS)
                    loading = null
                })
        }

        return loading
    }

    function genderLabel(value?: string | null): string {
        if (!value) {
            return ''
        }

        return DEFAULT_LABEL_KEYS[value] ? t(DEFAULT_LABEL_KEYS[value]) : value
    }

    /**
     * Dropdown options, always including `current` so a value that is not in
     * the list yet (just typed, or the list still loading) still shows.
     */
    function genderOptions(current?: string | null) {
        const list = values.value.length ? [...values.value] : Object.keys(DEFAULT_LABEL_KEYS)
        if (current && !list.includes(current)) {
            list.push(current)
        }

        return list.map((value) => ({ value, label: genderLabel(value) }))
    }

    // Fetched again whenever a form opens, so a gender added a moment ago on
    // another citizen is offered here too.
    load(true)

    return { genderOptions, genderLabel, reloadGenders: () => load(true) }
}
