<template>
    <div>
        <Modal size="sm" :title="$t('calendar.cancel.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
                <LoadingSpinner :isActive="state.isSaving">
                    <form id="formCancelEvent" class="space-y-4" @submit.prevent="submit">
                        <p class="text-sm text-gray-600">{{ $t('calendar.cancel.intro') }}</p>
                        <div class="space-y-1">
                            <FormLabel for="cancel_reason" :label="$t('calendar.cancel.reason')" />
                            <FormTextArea id="cancel_reason" name="cancel_reason" :placeholder="$t('calendar.cancel.reasonPlaceholder')"
                                v-model="state.reason" />
                            <FormError :error="state.error?.errors?.reason?.[0]" />
                        </div>
                        <div class="flex items-center gap-x-2">
                            <FormSwitch :value="state.move" :label="$t('calendar.cancel.move')"
                                @toggleSwitch="state.move = !state.move" />
                            <p class="text-sm">{{ $t('calendar.cancel.move') }}</p>
                        </div>
                        <div v-if="state.move" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="reschedule_start" :label="$t('events.form.datetimeStart')" />
                                <FormDateTimeField id="reschedule_start" name="reschedule_start" v-model="state.start" />
                                <FormError :error="state.error?.errors?.reschedule_start?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="reschedule_end" :label="$t('events.form.dateTimeEnd')" />
                                <FormDateTimeField id="reschedule_end" name="reschedule_end" v-model="state.end" />
                                <FormError :error="state.error?.errors?.reschedule_end?.[0]" />
                            </div>
                        </div>
                        <FormButton type="submit" buttonStyle="danger" class="w-full">
                            {{ state.move ? $t('calendar.cancel.submitAndMove') : $t('calendar.cancel.submit') }}
                        </FormButton>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { myCalendarService } from '@/components/api/user/MyCalendarService'
import { cancelPayload, suggestedNewTime } from '@/composables/calendarCancel'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    // The event to cancel (uuid, date_time_start, date_time_end).
    event: {
        type: Object,
        default: null,
    },
})
const emit = defineEmits(['close', 'cancelled'])
const { t } = useI18n()
const { successAlert } = useAlert()

const state = reactive({
    reason: '',
    move: false,
    start: '',
    end: '',
    isSaving: false,
    error: {} as Error,
})

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (!isOpen) return
    const next = suggestedNewTime(props.event?.date_time_start ?? '', props.event?.date_time_end ?? '')
    state.reason = ''
    state.move = false
    state.start = next.start
    state.end = next.end
    state.error = {}
})

function closeModal() {
    emit('close')
}

async function submit() {
    if (!props.event?.uuid) return
    state.error = {}
    state.isSaving = true
    try {
        const response = await myCalendarService.cancel(props.event.uuid, cancelPayload(state.reason, state.move, state.start, state.end))
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, state.move ? t('calendar.cancel.doneAndMoved') : t('calendar.cancel.done'))
            emit('cancelled', response.data)
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
