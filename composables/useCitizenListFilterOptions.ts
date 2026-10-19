import { useI18n } from 'vue-i18n'
import { municipalityService } from '@/components/api/user/MunicipalityService'
import { regionService } from '@/components/api/user/RegionService'
import { sectionService } from '@/components/api/user/SectionService'
import { userService } from '@/components/api/user/UserService'
import { useGenders } from '@/composables/genders'
import { useSpokenLanguages } from '@/composables/useSpokenLanguages'
import type { CitizenListFilter, CitizenListFilterOptions } from '@/utils/citizenListFilters'

type Option = { value: string, label: string }
type FetchedList = 'employees' | 'municipalities' | 'regions' | 'sections' | 'spokenLanguages'

// Shared between the filter panel and the chips on the list, so a chip can
// name the value it filters on without fetching the lists a second time.
const fetched = reactive<Record<FetchedList, Option[]>>({
    employees: [],
    municipalities: [],
    regions: [],
    sections: [],
    spokenLanguages: [],
})
const loading = new Set<FetchedList>()

/**
 * The options behind the citizen list's select filters (CITIZEN_LIST_FILTERS).
 */
export function useCitizenListFilterOptions() {
    const { t } = useI18n()
    const { genderOptions } = useGenders()
    const { fetchOptions: fetchSpokenLanguageOptions } = useSpokenLanguages()

    const fixed = computed<Record<string, Option[]>>(() => ({
        genders: genderOptions(),
        coordinatorRoles: ['primary', 'secondary', 'intake']
            .map((value) => ({ value, label: t(`citizens.coordinators.${value}`) })),
        // Same values as the backend derives in the list query (CitizenListColumns).
        phases: ['upcoming', 'active', 'ended']
            .map((value) => ({ value, label: t(`citizens.table.phases.${value}`) })),
        startupStatuses: ['missing_coordinator', 'missing_consultant', 'missing_start_date', 'ready', 'started']
            .map((value) => ({ value, label: t(`citizens.table.startupStatuses.${value}`) })),
        riskLevels: ['green', 'yellow', 'red']
            .map((value) => ({ value, label: t(`citizens.filters.risk.${value}`) })),
        yesNo: [{ value: 'true', label: t('yes') }, { value: 'false', label: t('no') }],
    }))

    function optionsFor(source?: CitizenListFilterOptions): Option[] {
        if (!source) return []
        if (source in fetched) return fetched[source as FetchedList]

        return fixed.value[source] ?? []
    }

    async function fetchList(key: FetchedList, fetcher: () => Promise<any>, toOption: (item: any) => Option) {
        if (fetched[key].length > 0 || loading.has(key)) return
        loading.add(key)
        try {
            const response = await fetcher()
            fetched[key] = (response?.data ?? []).map(toOption)
        } catch (error: any) {
            // A missing option list should not stop the rest of the panel from working.
        } finally {
            loading.delete(key)
        }
    }

    /** Fetches the lists the given filters use, each once. */
    async function load(filters: CitizenListFilter[]) {
        const needed = new Set(filters.map((filter) => filter.options).filter(Boolean) as string[])
        const jobs: Promise<any>[] = []

        if (needed.has('municipalities')) {
            jobs.push(fetchList('municipalities', () => municipalityService.getAllMunicipalities(),
                (item: any) => ({ value: item.uuid, label: item.name })))
        }
        if (needed.has('regions')) {
            jobs.push(fetchList('regions', () => regionService.getAllRegions(),
                (item: any) => ({ value: item.uuid, label: item.name })))
        }
        if (needed.has('sections')) {
            jobs.push(fetchList('sections', () => sectionService.getAllSections(),
                (item: any) => ({ value: item.uuid, label: item.label ?? item.name })))
        }
        if (needed.has('employees')) {
            jobs.push(fetchList('employees', () => userService.getAllUsersWithoutAllUsersOption(),
                (employee: any) => ({ value: employee.uuid, label: `${employee.firstname ?? ''} ${employee.lastname ?? ''}`.trim() })))
        }
        if (needed.has('spokenLanguages') && fetched.spokenLanguages.length === 0 && !loading.has('spokenLanguages')) {
            loading.add('spokenLanguages')
            jobs.push(fetchSpokenLanguageOptions()
                .then((options: any) => { fetched.spokenLanguages = options ?? [] })
                .catch(() => { /* Same. */ })
                .finally(() => loading.delete('spokenLanguages')))
        }

        await Promise.all(jobs)
    }

    /** What a chip shows for a value: the option's label, or the value itself. */
    function valueLabel(filter: CitizenListFilter, value: any): string {
        if (filter.type === 'checkbox') return ''
        if (filter.type === 'select') {
            const match = optionsFor(filter.options).find((option) => String(option.value) === String(value))
            if (match) return match.label
        }

        return String(value)
    }

    return { optionsFor, load, valueLabel }
}
