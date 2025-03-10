<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormSelect id="recipient" :options="state.options.recipients"
                        v-model="state.formSwapScheduleRequest.recipient" />
                    <FormError :error="v$?.formSwapScheduleRequest?.recipient?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.recipient_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="note"
                        :label="$t('dutySchedules.scheduleRequests.changeTime.form.whyDoYouWantToRequestAdditionalHours')" />
                    <FormTextArea id="note" name="note"
                        :placeholder="`${$t('dutySchedules.scheduleRequests.changeTime.form.whyDoYouWantToRequestAdditionalHours')}?`"
                        v-model="state.formSwapScheduleRequest.note" />
                    <FormError :error="v$?.formSwapScheduleRequest?.note?.$errors[0]?.$message.toString()" />
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
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { shiftSwapRequestService } from '@/components/api/user/ShiftSwapRequestService'
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
    selectedSchedule: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm', 'closeModal'])
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formSwapScheduleRequest: {
        schedule_uuid: props.selectedSchedule?.schedule_uuid,
        recipient: props.selectedSchedule?.recipient,
        note: props.selectedSchedule?.note,
    },
    options: {
        recipients: [],
    },
})

onMounted(() => {
    fetchAllAvailableChatUsers()
})

async function fetchAllAvailableChatUsers() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await shiftSwapRequestService.getAllAvailableUsers()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + user?.lastname,
                })
            )
            state.options.recipients = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function closeModal() {
    emit('closeModal')
}

const rules = computed(() => {
    return {
        formSwapScheduleRequest: {
            recipient: {
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
        emit('submitForm', state.formSwapScheduleRequest)
    }
}
</script>