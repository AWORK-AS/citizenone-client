<template>
    <form @submit.prevent="submitForm()" class="mt-4">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="agreement_uuid" :label="$t('employment.cases.form.agreement')" />
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
                <FormDateField id="start_date" name="start_date" v-model="state.form.start_date" />
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
                        v-model="state.form.duration_weeks" />
                    <FormError :error="props?.error?.errors?.duration_weeks?.[0]" />
                </div>
                <div v-else class="space-y-1">
                    <FormLabel for="end_date" :label="$t('employment.cases.form.endDate')" />
                    <FormDateField id="end_date" name="end_date" v-model="state.form.end_date" />
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
</template>

<script setup lang="ts">
import { employmentAgreementService } from '@/components/api/user/EmploymentService'
import { userService } from '@/components/api/user/UserService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    error: { type: Object, required: false },
    formType: { type: String, required: true },
    selectedCase: { type: Object, required: false },
})
const emit = defineEmits(['submitForm', 'closeModal', 'isPageLoading'])

const { t } = useI18n()

const statusOptions = computed(() => [
    { value: 'active', label: t('employment.cases.form.statusOptions.active') },
    { value: 'completed', label: t('employment.cases.form.statusOptions.completed') },
    { value: 'on_hold', label: t('employment.cases.form.statusOptions.on_hold') },
    { value: 'paused', label: t('employment.cases.form.statusOptions.paused') },
])

const state = reactive({
    error: {} as Error,
    periodMode: 'by_weeks' as 'by_weeks' | 'by_date',
    form: {
        agreement_uuid: null as string | null,
        user_uuid: null as string | null,
        start_date: '',
        end_date: '',
        duration_weeks: null as number | null,
        status: null as string | null,
        notes: '',
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
            duration_weeks: newValue.duration_weeks ?? null,
            status: newValue.status ?? null,
            notes: newValue.notes ?? '',
        }
    }
})

function onAgreementChange(uuid: string) {
    const agreement = state.agreementsRaw.find((a: any) => a.uuid === uuid)
    if (agreement?.default_duration_weeks && state.periodMode === 'by_weeks') {
        state.form.duration_weeks = agreement.default_duration_weeks
    }
}

async function fetchAgreements() {
    emit('isPageLoading', true)
    try {
        const response = await employmentAgreementService.getAllAgreements()
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
