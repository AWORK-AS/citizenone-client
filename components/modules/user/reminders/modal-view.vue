<template>
    <div>
        <Modal size="md" :title="$t('reminders.reminder')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div v-if="state.reminder?.due_dates?.length > 0" class="mt-10 mb-4 space-y-2">
                        <div v-for="(due, index) in state.reminder?.due_dates" :key="index" class="bg-white shadow-md rounded-md border-l-8 mt-2 text-sm space-y-2 pr-5 pt-5 pb-5 pl-6 mr-1
                        border-yellow-500">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-lg">
                                        {{ state.reminder?.title }}
                                    </p>
                                    <p class="text-sm">
                                        {{ formatDateTimeToReadable(due?.date) }}
                                    </p>
                                </div>
                                <div class="flex items-center gap-x-4">
                                    <Tooltip :text="$t('reminders.table.markAsComplete')" v-if="!due?.is_complete">
                                        <FormButton buttonStyle="primary" class="rounded-md" buttonSize="sm"
                                            @click="markAsCompleteIncomplete(due)">
                                            <Icon name="ph:check" class="h-4 w-4" aria-hidden="true" />
                                        </FormButton>
                                    </Tooltip>
                                    <Tooltip :text="$t('reminders.table.markAsIncomplete')" v-else>
                                        <FormButton buttonStyle="danger" class="rounded-md" buttonSize="sm"
                                            @click="markAsCompleteIncomplete(due)">
                                            <Icon name="ph:x" class="h-4 w-4" aria-hidden="true" />
                                        </FormButton>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="state.reminder?.due_dates?.length === 0" class="py-24 text-center">
                        {{ $t('theresNoDataAvailableToDisplay') }}.
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>

</template>

<script setup lang="ts">
import { reminderService } from '@/components/api/user/ReminderService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const { formatDateTimeToReadable } = useDatetimeFormatter()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedReminder: {
        type: Object,
        required: true,
    }
})

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    reminder: {} as any,
})

const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchReminder()
    }
})

async function fetchReminder() {
    state.error = {}
    state.isPageLoading = true
    try {
        const reminderUuid = props.selectedReminder?.uuid
        const response = await reminderService.getReminder(reminderUuid)
        if (response) {
            state.reminder = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function markAsCompleteIncomplete(reminder: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            reminder_uuid: props.selectedReminder?.uuid,
            due_date_time: reminder?.date,
        }
        const response = await reminderService.toggleReminderCompleteIncomplete(params)
        if (response) {
            fetchReminder()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>