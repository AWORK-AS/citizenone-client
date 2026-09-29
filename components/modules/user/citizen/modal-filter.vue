<template>
    <Modal size="sm" :title="$t('filter')" :show="props.isModalOpen" @close="closeModal">
        <template #modal-body>
            <div class="space-y-4">
                <div class="space-y-1">
                    <FormLabel for="filter_gender" :label="$t('citizens.form.gender')" />
                    <FormSelect id="filter_gender" :options="genderOptions"
                        :placeholder="$t('citizens.filters.any')" v-model="state.filter.gender" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="filter_spoken_language" :label="$t('citizens.filters.spokenLanguage')" />
                    <FormSelect id="filter_spoken_language" :options="state.options.spokenLanguages"
                        :placeholder="$t('citizens.filters.any')" v-model="state.filter.spoken_language" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="filter_coordinator" :label="$t('citizens.coordinators.title')" />
                    <FormSelect id="filter_coordinator" :options="state.options.employees"
                        :placeholder="$t('citizens.filters.any')" v-model="state.filter.coordinator" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="filter_coordinator_role" :label="$t('citizens.filters.coordinatorRole')" />
                    <FormSelect id="filter_coordinator_role" :options="coordinatorRoleOptions"
                        :placeholder="$t('citizens.filters.any')" v-model="state.filter.coordinator_role" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="filter_consultant" :label="$t('citizens.filters.consultant')" />
                    <FormSelect id="filter_consultant" :options="state.options.employees"
                        :placeholder="$t('citizens.filters.any')" v-model="state.filter.consultant" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="filter_municipality" :label="$t('citizens.table.municipality')" />
                    <FormSelect id="filter_municipality" :options="state.options.municipalities"
                        :placeholder="$t('citizens.filters.any')" v-model="state.filter.municipality_uuid" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="filter_region" :label="$t('citizens.filters.region')" />
                    <FormSelect id="filter_region" :options="state.options.regions"
                        :placeholder="$t('citizens.filters.any')" v-model="state.filter.region_uuid" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="filter_section" :label="$t('citizens.table.section')" />
                    <FormSelect id="filter_section" :options="state.options.sections"
                        :placeholder="$t('citizens.filters.any')" v-model="state.filter.section_uuid" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="filter_phase" :label="$t('citizens.table.phase')" />
                    <FormSelect id="filter_phase" :options="phaseOptions"
                        :placeholder="$t('citizens.filters.any')" v-model="state.filter.phase" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="filter_startup_status" :label="$t('citizens.table.startupStatus')" />
                    <FormSelect id="filter_startup_status" :options="startupStatusOptions"
                        :placeholder="$t('citizens.filters.any')" v-model="state.filter.startup_status" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="filter_weekly_hours_from" :label="$t('citizens.filters.weeklyHoursFrom')" />
                        <FormTextField id="filter_weekly_hours_from" name="filter_weekly_hours_from" type="number"
                            v-model="state.filter.weekly_hours_from" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="filter_weekly_hours_to" :label="$t('citizens.filters.weeklyHoursTo')" />
                        <FormTextField id="filter_weekly_hours_to" name="filter_weekly_hours_to" type="number"
                            v-model="state.filter.weekly_hours_to" />
                    </div>
                </div>

                <div class="space-y-1">
                    <FormLabel for="filter_risk_level" :label="$t('citizens.filters.riskLevel')" />
                    <FormSelect id="filter_risk_level" :options="riskLevelOptions"
                        :placeholder="$t('citizens.filters.any')" v-model="state.filter.risk_level" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="filter_admitted_from" :label="$t('citizens.filters.admittedFrom')" />
                        <FormDateField id="filter_admitted_from" name="filter_admitted_from"
                            v-model="state.filter.admitted_from" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="filter_admitted_to" :label="$t('citizens.filters.admittedTo')" />
                        <FormDateField id="filter_admitted_to" name="filter_admitted_to"
                            v-model="state.filter.admitted_to" />
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <FormCheckbox :value="state.filter.requires_interpreter === true"
                        @click="toggleInterpreter" />
                    <span class="text-sm text-gray-700">{{ $t('citizens.filters.requiresInterpreter') }}</span>
                </div>

                <div class="flex items-center justify-between gap-2 pt-2">
                    <button type="button" class="text-sm font-medium text-gray-600 hover:underline" @click="reset">
                        {{ $t('table.clearFilters') }}
                    </button>
                    <div class="flex items-center gap-2">
                        <button type="button"
                            class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                            @click="closeModal">
                            {{ $t('cancel') }}
                        </button>
                        <FormButton type="button" buttonStyle="primary" @click="apply">
                            {{ $t('filter') }}
                        </FormButton>
                    </div>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { spokenLanguageService } from '@/components/api/user/SpokenLanguageService'
import { municipalityService } from '@/components/api/user/MunicipalityService'
import { regionService } from '@/components/api/user/RegionService'
import { sectionService } from '@/components/api/user/SectionService'
import { userService } from '@/components/api/user/UserService'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    /** The filter currently in force, so reopening shows what is set. */
    filter: {
        type: Object,
        default: () => ({}),
    },
})

const emit = defineEmits(['close', 'setFilter'])
const { t } = useI18n()

const EMPTY = {
    admitted_from: null as string | null,
    admitted_to: null as string | null,
    coordinator: null as string | null,
    coordinator_role: null as string | null,
    consultant: null as string | null,
    municipality_uuid: null as string | null,
    region_uuid: null as string | null,
    section_uuid: null as string | null,
    phase: null as string | null,
    startup_status: null as string | null,
    weekly_hours_from: null as string | number | null,
    weekly_hours_to: null as string | number | null,
    gender: null as string | null,
    requires_interpreter: null as boolean | null,
    risk_level: null as string | null,
    spoken_language: null as string | null,
}

const state = reactive({
    filter: { ...EMPTY },
    options: {
        employees: [] as any[],
        spokenLanguages: [] as any[],
        municipalities: [] as any[],
        regions: [] as any[],
        sections: [] as any[],
    },
})

const genderOptions = computed(() => [
    { value: 'male', label: t('gender.male') },
    { value: 'female', label: t('gender.female') },
    { value: 'non_binary', label: t('gender.nonbinary') },
    { value: 'will_not_disclose', label: t('gender.willNotDisclose') },
])

const coordinatorRoleOptions = computed(() => [
    { value: 'primary', label: t('citizens.coordinators.primary') },
    { value: 'secondary', label: t('citizens.coordinators.secondary') },
])

// Same values as the backend derives in the list query (CitizenListColumns).
const phaseOptions = computed(() => ['upcoming', 'active', 'ended'].map((value) => ({
    value,
    label: t(`citizens.table.phases.${value}`),
})))

const startupStatusOptions = computed(() => [
    'missing_coordinator', 'missing_consultant', 'missing_start_date', 'ready', 'started',
].map((value) => ({ value, label: t(`citizens.table.startupStatuses.${value}`) })))

const riskLevelOptions = computed(() => [
    { value: 'green', label: t('citizens.filters.risk.green') },
    { value: 'yellow', label: t('citizens.filters.risk.yellow') },
    { value: 'red', label: t('citizens.filters.risk.red') },
])

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (!isOpen) return

    state.filter = { ...EMPTY, ...props.filter }
    fetchOptions()
})

function toggleInterpreter() {
    state.filter.requires_interpreter = state.filter.requires_interpreter ? null : true
}

async function fetchOptions() {
    if (state.options.spokenLanguages.length === 0) {
        try {
            const response = await spokenLanguageService.getSpokenLanguages()
            state.options.spokenLanguages = (response?.data ?? []).map((language: any) => ({
                value: language.uuid,
                label: language.name,
            }))
        } catch (error: any) {
            // A missing option list should not stop the rest of the panel from working.
        }
    }

    await Promise.all([
        loadOptions('municipalities', () => municipalityService.getAllMunicipalities(), (item: any) => item.name),
        loadOptions('regions', () => regionService.getAllRegions(), (item: any) => item.name),
        loadOptions('sections', () => sectionService.getAllSections(), (item: any) => item.label ?? item.name),
    ])

    if (state.options.employees.length === 0) {
        try {
            const response = await userService.getAllUsersWithoutAllUsersOption()
            state.options.employees = (response?.data ?? []).map((employee: any) => ({
                value: employee.uuid,
                label: `${employee.firstname ?? ''} ${employee.lastname ?? ''}`.trim(),
            }))
        } catch (error: any) {
            // Same.
        }
    }
}

async function loadOptions(key: 'municipalities' | 'regions' | 'sections', fetcher: () => Promise<any>, label: (item: any) => string) {
    if (state.options[key].length > 0) return
    try {
        const response = await fetcher()
        state.options[key] = (response?.data ?? []).map((item: any) => ({ value: item.uuid, label: label(item) }))
    } catch (error: any) {
        // A missing option list should not stop the rest of the panel from working.
    }
}

function closeModal() {
    emit('close')
}

function apply() {
    emit('setFilter', { ...state.filter })
    closeModal()
}

function reset() {
    state.filter = { ...EMPTY }
    emit('setFilter', { ...EMPTY })
    closeModal()
}
</script>
