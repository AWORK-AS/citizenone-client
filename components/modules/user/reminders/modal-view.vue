<template>
    <div>
        <Modal size="md" :title="$t('reminders.reminder')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div v-if="state.reminder?.due_dates?.length > 0" class="mt-6 space-y-3">
                        <div v-for="(due, index) in state.reminder?.due_dates" :key="index"
                            class="rounded-xl border transition-colors px-5 pt-4 pb-4"
                            :class="due?.is_complete
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white border-gray-200 shadow-sm'">
                            <div class="flex items-start gap-3">
                                <!-- Completion indicator -->
                                <div class="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                                    :class="due?.is_complete
                                        ? 'bg-green-500'
                                        : 'border-2 border-gray-300'">
                                    <Icon v-if="due?.is_complete" name="ph:check" class="h-3.5 w-3.5 text-white" />
                                </div>

                                <div class="grow min-w-0">
                                    <p class="font-semibold leading-snug transition-all"
                                        :class="due?.is_complete ? 'line-through text-gray-400' : 'text-gray-900'">
                                        {{ state.reminder?.title }}
                                    </p>
                                    <p class="text-sm text-gray-500 mt-0.5">
                                        {{ formatDateTimeToReadable(due?.date) }}
                                    </p>

                                    <!-- Completion log -->
                                    <div v-if="due?.is_complete"
                                        class="flex items-center gap-1 mt-2 text-xs text-green-700">
                                        <Icon name="ph:check-circle-fill" class="h-3.5 w-3.5 flex-shrink-0" />
                                        <span>{{ $t('reminders.table.completed') }}</span>
                                        <template v-if="due?.completed_by?.firstname || due?.completed_by?.lastname">
                                            <span>·</span>
                                            <span class="font-medium">
                                                {{ due.completed_by?.firstname }} {{ due.completed_by?.lastname }}
                                            </span>
                                            <template v-if="due.completed_by?.profile_image">
                                                <img :src="due.completed_by.profile_image"
                                                    class="w-4 h-4 rounded-full object-cover ml-0.5"
                                                    :alt="due.completed_by.firstname" />
                                            </template>
                                        </template>
                                    </div>
                                </div>

                                <div class="flex-shrink-0">
                                    <Tooltip :text="$t('reminders.table.markAsComplete')" v-if="!due?.is_complete">
                                        <FormButton buttonStyle="primary" buttonSize="sm"
                                            @click="markAsCompleteIncomplete(due)">
                                            <Icon name="ph:check" class="h-4 w-4" aria-hidden="true" />
                                        </FormButton>
                                    </Tooltip>
                                    <Tooltip :text="$t('reminders.table.markAsIncomplete')" v-else>
                                        <FormButton buttonSize="sm" @click="markAsCompleteIncomplete(due)">
                                            <Icon name="ph:arrow-counter-clockwise" class="h-4 w-4"
                                                aria-hidden="true" />
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

const emit = defineEmits(['close', 'refreshReminders'])

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
            emit('refreshReminders')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
