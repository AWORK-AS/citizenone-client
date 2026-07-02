<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()" class="mt-6">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="date_time_start" :label="$t('dutySchedules.leaveRequests.form.dateTimeStart')" />
                    <DateTimeField id="date_time_start" name="date_time_start"
                        :placeholder="$t('dutySchedules.leaveRequests.form.dateTimeStart')"
                        v-model="state.formLeaveRequest.date_time_start" />
                    <FormError :error="v$?.formLeaveRequest?.date_time_start?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date_time_start?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="date_time_end" :label="$t('dutySchedules.leaveRequests.form.dateTimeEnd')" />
                    <DateTimeField id="date_time_end" name="date_time_end"
                        :placeholder="$t('dutySchedules.leaveRequests.form.dateTimeEnd')"
                        v-model="state.formLeaveRequest.date_time_end" />
                    <FormError :error="v$?.formLeaveRequest?.date_time_end?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date_time_end?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="type" :label="$t('dutySchedules.leaveRequests.form.type.type')" />
                    <FormSelect id="type" name="type" :options="state.options.leaveTypes"
                        v-model="state.formLeaveRequest.type" />
                    <FormError :error="v$?.formLeaveRequest?.type?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.system_name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="note" :label="$t('dutySchedules.leaveRequests.form.note')" />
                    <FormTextArea id="note" name="note" :placeholder="$t('dutySchedules.leaveRequests.form.note')"
                        v-model="state.formLeaveRequest.note" />
                    <FormError :error="v$?.formLeaveRequest?.note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.note?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" @click="closeModal" :disabled="props.isModalLoading">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" :disabled="props.isModalLoading">
                        {{ props.formType === 'create' ? $t('save') :
                            $t('update') }}
                    </FormButton>
                </div>
            </div>
        </form>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import DateTimeField from "~/components/form/DateTimeField.vue"

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedLeaveRequest: {
        type: Object,
        required: true,
    },
    isModalLoading: {
        type: Boolean,
        default: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm', 'closeModal'])
const { t } = useI18n()
const language = useI18n()

const state = reactive({
    error: {} as Error,
    formLeaveRequest: {
        date_time_start: props.selectedLeaveRequest?.date_time_start || '',
        date_time_end: props.selectedLeaveRequest?.date_time_end || '',
        type: props.selectedLeaveRequest?.type || '',
        note: props.selectedLeaveRequest?.note || '',
    } as any,
    isPageLoading: false,
    options: {
        leaveTypes: [
            { value: 'sick_leave', label: `${t('dutySchedules.leaveRequests.form.type.sickLeave')}`, },
            { value: 'vacation_leave', label: `${t('dutySchedules.leaveRequests.form.type.vacationLeave')}`, },
        ],
    }
})

watch(() => language.locale.value, () => {
    state.options.leaveTypes = [
        { value: 'sick_leave', label: `${t('dutySchedules.leaveRequests.form.type.sickLeave')}`, },
        { value: 'vacation_leave', label: `${t('dutySchedules.leaveRequests.form.type.vacationLeave')}`, },
    ]
})

function closeModal() {
    if (props.isModalLoading) return
    emit('closeModal')
}

const rules = computed(() => {
    return {
        formLeaveRequest: {
            date_time_start: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_time_end: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            type: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            note: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formLeaveRequest)
    }
}
</script>