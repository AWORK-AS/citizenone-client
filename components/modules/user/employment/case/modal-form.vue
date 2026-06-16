<template>
    <div>
        <form @submit.prevent="submitForm()" class="mt-4">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="agreement_uuid" :label="$t('employment.cases.form.agreement')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddAgreementOpen = true">
                            {{ $t('employment.agreements.newAgreement') }}
                        </span>
                    </div>
                    <FormSelect id="agreement_uuid" :options="state.options.agreements"
                        v-model="state.form.agreement_uuid" @update:modelValue="onAgreementChange" />
                    <FormError :error="v$?.form?.agreement_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.agreement_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="user_uuid" :label="$t('employment.cases.form.responsibleEmployee')" />
                    <FormSelect id="user_uuid" :options="state.options.users" v-model="state.form.user_uuid" />
                    <FormError :error="props?.error?.errors?.user_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="start_date" :label="$t('employment.cases.form.startDate')" />
                    <FormDateField id="start_date" name="start_date" :placeholder="$t('employment.cases.form.startDate')" v-model="state.form.start_date" />
                    <FormError :error="v$?.form?.start_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.start_date?.[0]" />
                </div>

                <div class="space-y-2">
                    <div class="flex gap-4">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" value="by_weeks" v-model="state.periodMode" class="cursor-pointer" />
                            <span class="text-sm">{{ $t('employment.cases.form.periodMode.byWeeks') }}</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" value="by_date" v-model="state.periodMode" class="cursor-pointer" />
                            <span class="text-sm">{{ $t('employment.cases.form.periodMode.byDate') }}</span>
                        </label>
                    </div>

                    <div v-if="state.periodMode === 'by_weeks'" class="space-y-1">
                        <FormLabel for="duration_weeks" :label="$t('employment.cases.form.durationWeeks')" />
                        <FormNumberField id="duration_weeks" name="duration_weeks" :min="1"
                            :placeholder="$t('employment.cases.form.durationWeeks')" v-model="state.form.duration_weeks" />
                        <FormError :error="props?.error?.errors?.duration_weeks?.[0]" />
                    </div>
                    <div v-else class="space-y-1">
                        <FormLabel for="end_date" :label="$t('employment.cases.form.endDate')" />
                        <FormDateField id="end_date" name="end_date" :placeholder="$t('employment.cases.form.endDate')" v-model="state.form.end_date" />
                        <FormError :error="props?.error?.errors?.end_date?.[0]" />
                    </div>
                </div>

                <div class="space-y-1">
                    <FormLabel for="status" :label="$t('employment.cases.form.status')" />
                    <FormSelect id="status" :options="statusOptions" v-model="state.form.status" />
                    <FormError :error="props?.error?.errors?.status?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="notes" :label="$t('employment.cases.form.notes')" />
                    <FormTextArea id="notes" name="notes" :placeholder="$t('employment.cases.form.notes')"
                        v-model="state.form.notes" />
                    <FormError :error="props?.error?.errors?.notes?.[0]" />
                </div>

                <template v-if="isEmploymentServices">
                    <div class="pt-2 border-t border-[#EAECF0]">
                        <label class="flex items-center justify-between cursor-pointer">
                            <span class="text-sm font-medium text-[#1F2533]">
                                {{ $t('employment.cases.form.reminderEnabled') }}
                            </span>
                            <button type="button"
                                class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                                :class="state.form.reminder_enabled ? 'bg-[#205E77]' : 'bg-[#D1D5DB]'"
                                @click="state.form.reminder_enabled = !state.form.reminder_enabled">
                                <span
                                    class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                                    :class="state.form.reminder_enabled ? 'translate-x-4' : 'translate-x-1'" />
                            </button>
                        </label>
                        <p class="text-[11px] text-[#8891A4] mt-1">
                            {{ $t('employment.cases.form.reminderEnabledHint') }}
                        </p>
                    </div>

                    <div v-if="state.form.reminder_enabled" class="space-y-1">
                        <FormLabel for="reporting_frequency_weeks"
                            :label="$t('employment.cases.form.reportingFrequencyWeeks')" />
                        <FormSelect id="reporting_frequency_weeks" :options="reportingFrequencyOptions"
                            v-model="state.form.reporting_frequency_weeks" />
                    </div>
                </template>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary">
                        {{ props.formType === 'create' ? $t('save') : $t('update') }}
                    </FormButton>
                </div>
            </div>
        </form>

        <ModulesUserEmploymentAgreementModalNew :isModalOpen="state.modal.isAddAgreementOpen"
            @close="state.modal.isAddAgreementOpen = false" @created="onAgreementCreated" />
    </div>
</template>

<script setup lang="ts">
import { employmentService } from '@/components/api/user/EmploymentService'
import { userService } from '@/components/api/user/UserService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const props = defineProps({
    error: { type: Object, required: false },
    formType: { type: String, required: true },
    selectedCase: { type: Object, required: false },
})
const emit = defineEmits(['submitForm', 'closeModal', 'isPageLoading'])

const { t } = useI18n()
const userStore = useUserStore()

const isEmploymentServices = computed(
    () => userStore.getUser?.company?.industry?.system_name === 'employment_services'
)

const statusOptions = computed(() => [
    { value: 'active', label: t('employment.cases.form.statusOptions.active') },
    { value: 'completed', label: t('employment.cases.form.statusOptions.completed') },
    { value: 'on_hold', label: t('employment.cases.form.statusOptions.on_hold') },
    { value: 'paused', label: t('employment.cases.form.statusOptions.paused') },
])

const reportingFrequencyOptions = computed(() => [
    { value: 2, label: t('employment.cases.form.reportingFrequencyOptions.every2weeks') },
    { value: 4, label: t('employment.cases.form.reportingFrequencyOptions.every4weeks') },
    { value: 6, label: t('employment.cases.form.reportingFrequencyOptions.every6weeks') },
    { value: 8, label: t('employment.cases.form.reportingFrequencyOptions.every8weeks') },
])

const state = reactive({
    error: {} as Error,
    modal: {
        isAddAgreementOpen: false,
    },
    periodMode: 'by_weeks' as 'by_weeks' | 'by_date',
    form: {
        agreement_uuid: null as string | null,
        user_uuid: null as string | null,
        start_date: '',
        end_date: '',
        duration_weeks: null as number | null,
        status: null as string | null,
        notes: '',
        reminder_enabled: false,
        reporting_frequency_weeks: null as number | null,
    },
    options: {
        agreements: [] as any[],
        users: [] as any[],
    },
    agreementsRaw: [] as any[],
})

onMounted(() => {
    fetchAgreements()
    fetchUsers()
})

watch(() => props.selectedCase, (newValue: any) => {
    if (newValue != null) {
        state.periodMode = newValue.end_date ? 'by_date' : 'by_weeks'
        state.form = {
            agreement_uuid: newValue.agreement?.uuid ?? null,
            user_uuid: newValue.user?.uuid ?? null,
            start_date: newValue.start_date ?? '',
            end_date: newValue.end_date ?? '',
            duration_weeks: newValue.duration_weeks != null ? String(newValue.duration_weeks) : null,
            status: newValue.status ?? null,
            notes: newValue.notes ?? '',
            reminder_enabled: newValue.reminder_enabled ?? false,
            reporting_frequency_weeks: newValue.reporting_frequency_weeks ?? null,
        }
    }
})

function onAgreementCreated(newAgreement: any) {
    const option = { value: newAgreement.uuid, label: newAgreement.name }
    state.agreementsRaw.push(newAgreement)
    state.options.agreements.push(option)
    state.form.agreement_uuid = newAgreement.uuid
    if (newAgreement.default_duration_weeks && state.periodMode === 'by_weeks') {
        state.form.duration_weeks = String(newAgreement.default_duration_weeks)
    }
}

function onAgreementChange(uuid: string) {
    const agreement = state.agreementsRaw.find((a: any) => a.uuid === uuid)
    if (agreement?.default_duration_weeks && state.periodMode === 'by_weeks') {
        state.form.duration_weeks = String(agreement.default_duration_weeks)
    }
}

async function fetchAgreements() {
    emit('isPageLoading', true)
    try {
        const response = await employmentService.getAllAgreements()
        if (response?.data) {
            state.agreementsRaw = response.data
            state.options.agreements = response.data.map((item: any) => ({
                value: item.uuid,
                label: item.name,
            }))
        }
    } catch { /* ignore */ }
    emit('isPageLoading', false)
}

async function fetchUsers() {
    try {
        const response = await userService.getAllUsers({})
        if (response?.data) {
            state.options.users = response.data.map((user: any) => ({
                value: user.uuid,
                label: `${user.firstname} ${user.lastname ?? ''}`.trim(),
            }))
        }
    } catch { /* ignore */ }
}

const rules = computed(() => ({
    form: {
        agreement_uuid: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        start_date: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        const payload: any = {
            agreement_uuid: state.form.agreement_uuid,
            user_uuid: state.form.user_uuid,
            start_date: state.form.start_date,
            status: state.form.status,
            notes: state.form.notes,
            reminder_enabled: state.form.reminder_enabled,
            reporting_frequency_weeks: state.form.reminder_enabled ? state.form.reporting_frequency_weeks : null,
        }
        if (state.periodMode === 'by_weeks') {
            payload.duration_weeks = state.form.duration_weeks
        } else {
            payload.end_date = state.form.end_date
        }
        emit('submitForm', payload)
    }
}
</script>
