<template>
    <div>
        <Modal size="md" :title="$t('dutySchedules.draft.preset.applyPreset')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                        <div>
                            <nav aria-label="Progress">
                                <ol role="list" class="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
                                    <li v-for="(step, stepId) in state.steps" :key="stepId" class="relative md:flex md:flex-1">
                                        <a v-if="step.status === 'completed'" :href="step.href" class="group flex w-full items-center">
                                            <span class="flex items-center px-6 py-4 text-sm font-medium">
                                                <span
                                                    class="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary group-hover:bg-secondary-600">
                                                    <Icon name="ph:check" class="h-6 w-6 text-white" aria-hidden="true" />
                                                </span>
                                                <p class="ml-4 text-sm font-medium text-gray-900">
                                                    <span v-if="step.name === 'Select Date Range'">
                                                        {{ $t('dutySchedules.draft.preset.form.selectDateRange') }}
                                                    </span>
                                                    <span v-if="step.name === 'Preview'">
                                                        {{ $t('dutySchedules.draft.preset.form.preview') }}
                                                    </span>
                                                </p>
                                            </span>
                                        </a>
                                        <a v-else-if="step.status === 'current'" :href="step.href"
                                            class="flex items-center px-6 py-4 text-sm font-medium" aria-current="step">
                                            <span
                                                class="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-secondary">
                                                <span class="text-secondary">{{ step.id }}</span>
                                            </span>
                                            <p class="ml-4 text-sm font-medium text-secondary">
                                                <span v-if="step.name === 'Select Date Range'">
                                                    {{ $t('dutySchedules.draft.preset.form.selectDateRange') }}
                                                </span>
                                                <span v-if="step.name === 'Preview'">
                                                    {{ $t('dutySchedules.draft.preset.form.preview') }}
                                                </span>
                                            </p>
                                        </a>
                                        <a v-else :href="step.href" class="group flex items-center">
                                            <span class="flex items-center px-6 py-4 text-sm font-medium">
                                                <span
                                                    class="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400">
                                                    <span class="text-gray-500 group-hover:text-gray-900">{{ step.id }}</span>
                                                </span>
                                                <p class="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                                                    <span v-if="step.name === 'Preset'">
                                                        Preset
                                                    </span>
                                                    <span v-if="step.name === 'Preview'">
                                                        Preview
                                                    </span>
                                                </p>
                                            </span>
                                        </a>
                                        <template v-if="stepId !== state.steps.length - 1">
                                            <!-- Arrow separator for lg screens and up -->
                                            <div class="absolute right-0 top-0 hidden h-full w-5 md:block" aria-hidden="true">
                                                <svg class="size-full text-gray-300" viewBox="0 0 22 80" fill="none"
                                                    preserveAspectRatio="none">
                                                    <path d="M0 -2L20 40L0 82" vector-effect="non-scaling-stroke" stroke="currentcolor"
                                                        stroke-linejoin="round" />
                                                </svg>
                                            </div>
                                        </template>
                                    </li>
                                </ol>
                            </nav>
                            <form @submit.prevent="handleNext()" class="mt-6 max-w-xl">
                                <Alert type="danger" :text="props?.error?.message"
                                    v-if="props.error?.message && props.error.message.length > 0" />
                                <div class="space-y-3" v-if="state.currentStep === 1">
                                    <!-- Forklaringsboks -->
                                    <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2 mb-2">
                                        <svg class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        <div class="text-xs text-blue-700">
                                            <p class="font-semibold text-blue-800 mb-1">Hvilken periode skal forudindstillingen dække?</p>
                                            <p>Vælg den periode i din kladde som forudindstillingens vagter skal kopieres ind i. Systemet vil automatisk tilpasse vagterne til de valgte datoer.</p>
                                            <p class="mt-1 text-blue-600"><strong>Eksempel:</strong> Vælg mandag d. 14. april som startdato og søndag d. 20. april som slutdato for at fylde uge 16 ud med forudindstillingens vagtmønster.</p>
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="target_start_date" :label="$t('dutySchedules.draft.preset.form.dateStart')" />
                                        <FormDateField id="target_start_date" name="target_start_date" :placeholder="$t('dutySchedules.draft.preset.form.dateStart')"
                                            v-model="state.formDutySchedulePreset.target_start_date" />
                                        <FormError :error="v$?.formDutySchedulePreset?.target_start_date?.$errors[0]?.$message.toString()" />
                                        <FormError :error="props?.error?.errors?.target_start_date?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="target_end_date" :label="$t('dutySchedules.draft.preset.form.dateEnd')" />
                                        <FormDateField id="target_end_date" name="target_end_date" :placeholder="$t('dutySchedules.draft.preset.form.dateEnd')"
                                            v-model="state.formDutySchedulePreset.target_end_date" />
                                        <FormError :error="v$?.formDutySchedulePreset?.target_end_date?.$errors[0]?.$message.toString()" />
                                        <FormError :error="props?.error?.errors?.target_end_date?.[0]" />
                                    </div>
                                </div>

                                <div class="space-y-3" v-if="state.currentStep === 2 && state.presetPreview">
                                    <div class="space-y-1">
                                        <FormLabel :label="$t('dutySchedules.draft.preset.form.name')" />
                                        <p class="text-sm font-semibold text-gray-700">{{ props?.selectedPreset?.name }}</p>
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :label="$t('dutySchedules.draft.preset.form.presetDateRange')" />
                                        <p class="text-sm font-semibold text-gray-700">{{ formatDateToReadable(state.presetPreview?.original_range?.start) }} - {{ formatDateToReadable(state.presetPreview?.original_range?.end) }}</p>
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :label="$t('dutySchedules.draft.preset.form.targetDateRange')" />
                                        <p class="text-sm font-semibold text-gray-700">{{ formatDateToReadable(state.presetPreview?.target_range?.start) }} - {{ formatDateToReadable(state.presetPreview?.target_range?.end) }}</p>
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :label="`${$t('dutySchedules.draft.preset.form.affectedDepartments')} (${state.presetPreview.affected_departments.length})`" />
                                        <p class="text-sm font-semibold text-gray-700">{{ state.presetPreview.affected_departments.map((i: any) => i.name).join(', ') }}</p>
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :label="`${$t('dutySchedules.draft.preset.form.affectedUsers')} (${state.presetPreview.affected_users_count})`" />
                                        <div class="max-h-44 mt-6 overflow-auto">
                                            <div class="flex items-center gap-x-2 py-1" v-for="employee in state.presetPreview.affected_users.sort((a: any, b: any) => a.firstname.localeCompare(b.firstname))" :key="employee.uuid">
                                                <img :src="employee?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${employee?.firstname + ' ' + employee?.lastname}`"
                                                    :class="[
                                                        'h-10 w-10 rounded-full bg-gray-50 object-cover border-2'
                                                    ]" />
                                                <p class="text-sm font-medium">
                                                    {{ employee?.firstname }}
                                                    {{ employee?.lastname }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mt-10">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                            @click="closeModal()" v-if="state.currentStep === 1">
                                            {{ $t('cancel') }}
                                        </FormButton>
                                        <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="handleBack()"
                                            v-if="state.currentStep > 1" >
                                            {{ $t('back') }}
                                        </FormButton>
                                        <FormButton type="submit" buttonStyle="primary" class="rounded-md"
                                            v-if="state.currentStep === 1">
                                            {{ $t('next') }}
                                        </FormButton>
                                        <FormButton type="submit" buttonStyle="primary" class="rounded-md" v-if="state.currentStep > 1">
                                            {{ $t('dutySchedules.draft.preset.form.apply') }}
                                        </FormButton>
                                    </div>
                                </div>
                            </form>
                        </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useAlert } from '@/composables/alert'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { draftSchedulePresetService } from '@/components/api/user/DraftSchedulePresetService'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedPreset: {
        type: Object,
        required: true,
    },
})

const { t } = useI18n()
const { successAlert } = useAlert()
const { formatDateToReadable } = useDatetimeFormatter()
const emit = defineEmits(['close', 'refreshPresets'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    currentStep: 1,
    presetPreview: null as any,
    formDutySchedulePreset: {
        target_start_date: '',
        target_end_date: '',
    },
    steps: [
        { id: '01', name: 'Select Date Range', href: '#', status: 'current' },
        { id: '02', name: 'Preview', href: '#', status: 'upcoming' },
    ],
})

const rules = computed(() => {
    return {
        formDutySchedulePreset: {
            target_start_date: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            target_end_date: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

onMounted(() => {

})

function handleBack() {
    state.currentStep = 1
    state.steps = [
        { id: '01', name: 'Select Date Range', href: '#', status: 'current' },
        { id: '02', name: 'Preview', href: '#', status: 'upcoming' },
    ]
}

function handleNext() {
    if (state.currentStep === 1) {
        v$.value.$validate()
        if (!v$.value.$error) {
            state.currentStep = 2
            state.steps = [
                { id: '01', name: 'Select Date Range', href: '#', status: 'completed' },
                { id: '02', name: 'Preview', href: '#', status: 'current' },
            ]
            fetchPresetPreview()
        }
        
    } else {
        submitForm()
    }
}

async function fetchPresetPreview() {
    state.isPageLoading = true
    try {
        const params = {
            target_start_date: state.formDutySchedulePreset.target_start_date,
            target_end_date: state.formDutySchedulePreset.target_end_date,
        }
        const response = await draftSchedulePresetService.applyPresetPreview(props.selectedPreset.uuid, params)
        state.presetPreview = response.data
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}

async function applyPreset() {
    state.isPageLoading = true
    try {
        const params = {
            target_start_date: state.formDutySchedulePreset.target_start_date,
            target_end_date: state.formDutySchedulePreset.target_end_date,
        }
        await draftSchedulePresetService.applyPreset(props.selectedPreset.uuid, params)
        successAlert(`${t('alert.success')}!`, `${t('dutySchedules.draft.preset.applySuccess')}`)
        emit('refreshPresets')
        closeModal()
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}

async function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        await applyPreset()
    }
}

</script>