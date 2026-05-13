<template>
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
                                <span v-if="step.name === 'Preset'">
                                    {{ $t('dutySchedules.draft.preset.form.preset') }}
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
                            <span v-if="step.name === 'Preset'">
                                {{ $t('dutySchedules.draft.preset.form.preset') }}
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
                                    {{ $t('dutySchedules.draft.preset.form.preset') }}
                                </span>
                                <span v-if="step.name === 'Preview'">
                                    {{ $t('dutySchedules.draft.preset.form.preview') }}
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
                <div class="space-y-1">
                    <FormLabel for="name" :label="$t('dutySchedules.draft.preset.form.name')" />
                    <FormTextField id="name" name="name" :placeholder="$t('dutySchedules.draft.preset.form.name')"
                        v-model="state.formDutySchedulePreset.name" />
                    <FormError :error="v$?.formDutySchedulePreset?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="date_start" :label="$t('dutySchedules.draft.preset.form.dateStart')" />
                    <FormDateField id="date_start" name="date_start"
                        :placeholder="$t('dutySchedules.draft.preset.form.dateStart')"
                        v-model="state.formDutySchedulePreset.date_start" />
                    <FormError :error="v$?.formDutySchedulePreset?.date_start?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date_start?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="date_end" :label="$t('dutySchedules.draft.preset.form.dateEnd')" />
                    <FormDateField id="date_end" name="date_end"
                        :placeholder="$t('dutySchedules.draft.preset.form.dateEnd')"
                        v-model="state.formDutySchedulePreset.date_end" />
                    <FormError :error="v$?.formDutySchedulePreset?.date_end?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date_end?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="description" :label="$t('dutySchedules.draft.preset.form.description')" />
                    <FormTextArea id="description" name="description"
                        :placeholder="$t('dutySchedules.draft.preset.form.description')"
                        v-model="state.formDutySchedulePreset.description" />
                </div>
            </div>

            <div class="space-y-3" v-if="state.currentStep === 2 && state.presetPreview">
                <div class="space-y-1">
                    <FormLabel :label="$t('dutySchedules.draft.preset.form.name')" />
                    <p class="text-sm font-semibold text-gray-700">{{ state.formDutySchedulePreset.name }}</p>
                </div>
                <div class="space-y-1">
                    <FormLabel :label="$t('dutySchedules.draft.preset.form.presetDateRange')" />
                    <p class="text-sm font-semibold text-gray-700">{{
                        formatDateToReadable(state.formDutySchedulePreset.date_start) }} - {{
                            formatDateToReadable(state.formDutySchedulePreset.date_end) }}</p>
                </div>
                <div class="space-y-1">
                    <FormLabel
                        :label="`${$t('dutySchedules.draft.preset.form.affectedDepartments')} (${state.presetPreview.affected_departments.length})`" />
                    <p class="text-sm font-semibold text-gray-700">{{state.presetPreview.affected_departments.map((i:
                        any) =>
                        i.name).join(', ')}}</p>
                </div>
                <div class="space-y-1">
                    <FormLabel
                        :label="`${$t('dutySchedules.draft.preset.form.affectedUsers')} (${state.presetPreview.affected_users_count})`" />
                    <div class="max-h-44 mt-6 overflow-auto">
                        <div class="flex items-center gap-x-2 py-1"
                            v-for="employee in state.presetPreview.affected_users.sort((a: any, b: any) => a.firstname.localeCompare(b.firstname))"
                            :key="employee.uuid">
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
                    <FormButton type="button" buttonStyle="cancel" @click="closeForm()" v-if="state.currentStep === 1">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="button" buttonStyle="cancel" @click="handleBack()" v-if="state.currentStep > 1">
                        {{ $t('back') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" v-if="state.currentStep === 1">
                        {{ $t('next') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" v-if="state.currentStep > 1">
                        {{ props.formType === 'create' ? $t('save') :
                            $t('update') }}
                    </FormButton>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { draftSchedulePresetService } from "~/components/api/user/DraftSchedulePresetService"

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm', 'closeModal'])

const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    currentStep: 1,
    error: {} as Error,
    formDutySchedulePreset: {
        name: '',
        description: '',
        date_start: '',
        date_end: '',
    },
    steps: [
        { id: '01', name: 'Preset', href: '#', status: 'current' },
        { id: '02', name: 'Preview', href: '#', status: 'upcoming' },
    ],
    presetPreview: null as any,
})

const rules = computed(() => {
    return {
        formDutySchedulePreset: {
            name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_start: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_end: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

onMounted(() => {

})

function closeForm() {
    emit('closeModal')
}

function handleBack() {
    state.currentStep = 1
    state.steps = [
        { id: '01', name: 'Preset', href: '#', status: 'current' },
        { id: '02', name: 'Preview', href: '#', status: 'upcoming' },
    ]
}

function handleNext() {
    if (state.currentStep === 1) {
        v$.value.$validate()
        if (!v$.value.$error) {
            state.currentStep = 2
            state.steps = [
                { id: '01', name: 'Preset', href: '#', status: 'completed' },
                { id: '02', name: 'Preview', href: '#', status: 'current' },
            ]
            previewPreset()
        }
    } else {
        submitForm()
    }
}

async function previewPreset() {
    emit('isPageLoading', true)
    try {
        const response = await draftSchedulePresetService.previewPreset(state.formDutySchedulePreset)
        state.presetPreview = response.data
    } catch (error: any) {
        state.error = error
    } finally {
        emit('isPageLoading', false)
    }
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formDutySchedulePreset)
    }
}
</script>
