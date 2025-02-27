<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="time_in" :label="$t('dutySchedules.scheduleRequests.form.timeIn')" />
                <FormTimeField id="time_in" name="time_in"
                    :placeholder="$t('dutySchedules.scheduleRequests.form.timeIn')"
                    v-model="state.formScheduleRequest.time_in"
                    class="border border-primary placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-700 focus:border-primary-700 focus:z-10 sm:text-sm" />
                <FormError :error="v$?.formScheduleRequest?.time_in?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.time_in?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="time_out" :label="$t('dutySchedules.scheduleRequests.form.timeOut')" />
                <FormTimeField id="time_out" name="time_out"
                    :placeholder="$t('dutySchedules.scheduleRequests.form.timeOut')"
                    v-model="state.formScheduleRequest.time_out"
                    class="border border-primary placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-700 focus:border-primary-700 focus:z-10 sm:text-sm" />
                <FormError :error="v$?.formScheduleRequest?.time_out?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.time_out?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="note" :label="$t('dutySchedules.scheduleRequests.form.note')" />
                <FormTextArea id="note" name="note"
                    :placeholder="`${$t('dutySchedules.scheduleRequests.form.whyDoYouWantToRequestAdditionalHours')}?`"
                    v-model="state.formScheduleRequest.note" />
                <FormError :error="v$?.formScheduleRequest?.note?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.note?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
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
import { useAlert } from '@/composables/alert'
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
    selectedDay: {
        type: Object,
        required: false,
    },
    selectedSchedule: {
        type: Object,
        required: true,
    }
})
const emit = defineEmits(['isPageLoading', 'submitForm', 'closeModal'])
const { errorAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formScheduleRequest: {
        schedule_uuid: props.selectedSchedule?.schedule_uuid,
        time_in: props.selectedSchedule?.time_in,
        time_out: props.selectedSchedule?.time_out,
        note: props.selectedSchedule?.note,
    }
})

function closeModal() {
    emit('closeModal')
}

const rules = computed(() => {
    return {
        formScheduleRequest: {
            time_in: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            time_out: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            note: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formScheduleRequest)
    }
}
</script>