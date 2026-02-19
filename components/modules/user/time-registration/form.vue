<template>
    <form @submit.prevent="submitForm()" class="mt-6">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="date_time_start" :label="$t('timeLogs.form.dateTimeStart')" />
                <FormDateTimeField id="date_time_start" name="date_time_start"
                    :placeholder="$t('timeLogs.form.dateTimeStart')" v-model="state.formTimeLog.date_time_start" />
                <FormError :error="v$?.formTimeLog?.date_time_start?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_time_start?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="date_time_end" :label="$t('timeLogs.form.dateTimeEnd')" />
                <FormDateTimeField id="date_time_end" name="date_time_end"
                    :placeholder="$t('timeLogs.form.dateTimeEnd')" v-model="state.formTimeLog.date_time_end" />
                <FormError :error="v$?.formTimeLog?.date_time_end?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_time_end?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="status" :label="$t('timeLogs.form.status.status')" />
                <FormSelect id="status" name="status" :options="state.options.statuses"
                    v-model="state.formTimeLog.status" />
                <FormError :error="v$?.formTimeLog?.status?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.status?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="remarks" :label="$t('timeLogs.form.remarks')" />
                <FormTextArea id="remarks" name="message" :placeholder="$t('timeLogs.form.remarks')"
                    v-model="state.formTimeLog.remarks" />
                <FormError :error="v$?.formTimeLog?.remarks?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.remarks?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedTimeLog: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formTimeLog: {
        date_time_start: '',
        date_time_end: '',
        status: '',
        remarks: '',
    },
    options: {
        statuses: [
            { value: 'cancelled_by_citizen', label: `${t('timeLogs.form.status.cancelledByCitizen')}` },
            { value: 'cancelled_by_employee', label: `${t('timeLogs.form.status.cancelledByEmployee')}` },
            { value: 'completed', label: `${t('timeLogs.form.status.completed')}` },
        ]
    }
})

onMounted(() => {
    state.formTimeLog = {
        date_time_start: props.selectedTimeLog.date_time_start,
        date_time_end: props.selectedTimeLog.date_time_end,
        status: props.selectedTimeLog.status,
        remarks: props.selectedTimeLog.remarks,
    }
})

watch(() => props.selectedTimeLog, (newValue: any) => {
    if (newValue != null) {
        state.formTimeLog = {
            date_time_start: newValue.date_time_start,
            date_time_end: newValue.date_time_end,
            status: newValue.status,
            remarks: newValue.remarks,
        }
    }
})

const rules = computed(() => {
    if (state.formTimeLog.status === 'cancelled_by_employee') {
        return {
            formTimeLog: {
                date_time_start: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                date_time_end: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                status: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                remarks: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else {
        return {
            formTimeLog: {
                date_time_start: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                date_time_end: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                status: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formTimeLog)
    }
}
</script>