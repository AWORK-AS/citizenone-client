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
