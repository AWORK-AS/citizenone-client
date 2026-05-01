<template>
    <div>
        <Modal size="md" :title="$t('reminders.reminder')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <div v-if="state.reminder?.title" class="space-y-5">

                        <!-- Title & notes -->
                        <div>
                            <h2 class="text-lg font-semibold text-gray-900">{{ state.reminder.title }}</h2>
                            <div v-if="state.reminder.notes" v-html="state.reminder.notes"
                                class="content mt-1 text-sm text-gray-600" />
                        </div>

                        <!-- Meta row -->
                        <div class="flex flex-wrap gap-x-6 gap-y-3 text-sm border-t border-gray-100 pt-4">
                            <!-- Creator -->
                            <div v-if="state.reminder.creator" class="flex items-center gap-2">
                                <Icon name="ph:user" class="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span class="text-gray-500">{{ $t('reminders.dateCreated') }}:</span>
                                <div class="flex items-center gap-1.5">
                                    <img v-if="state.reminder.creator.profile_image"
                                        :src="state.reminder.creator.profile_image"
                                        class="w-5 h-5 rounded-full object-cover" />
                                    <span class="font-medium text-gray-700">
                                        {{ state.reminder.creator.firstname }} {{ state.reminder.creator.lastname }}
                                    </span>
                                </div>
                            </div>

                            <!-- Repeat -->
                            <div class="flex items-center gap-2">
                                <Icon name="ph:arrows-clockwise" class="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span class="text-gray-500">{{ $t('reminders.form.repeat.repeat') }}:</span>
                                <span class="font-medium text-gray-700 capitalize">{{ state.reminder.repeat }}</span>
                            </div>
                        </div>

                        <!-- Assignees -->
                        <div v-if="state.reminder.reminder_users?.length > 0"
                            class="border-t border-gray-100 pt-4">
                            <p class="text-sm text-gray-500 mb-2">{{ $t('reminders.assignees') }}</p>
                            <div class="flex flex-wrap gap-2">
                                <div v-for="ru in state.reminder.reminder_users" :key="ru.id"
                                    class="flex items-center gap-1.5 bg-gray-50 rounded-full pl-1 pr-3 py-0.5">
                                    <img v-if="ru.user?.profile_image" :src="ru.user.profile_image"
                                        class="w-6 h-6 rounded-full object-cover" />
                                    <div v-else
                                        class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xxs font-medium">
                                        {{ ru.user?.firstname?.[0] }}{{ ru.user?.lastname?.[0] }}
                                    </div>
                                    <span class="text-xs font-medium text-gray-700">
                                        {{ ru.user?.firstname }} {{ ru.user?.lastname }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Due dates -->
                        <div class="border-t border-gray-100 pt-4 space-y-3">
                            <p class="text-sm text-gray-500">{{ $t('reminders.form.dueDate') }}</p>
                            <div v-for="(due, index) in state.reminder.due_dates" :key="index"
                                class="rounded-xl border transition-colors px-4 py-3"
                                :class="due?.is_complete ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 shadow-sm'">
                                <div class="flex items-center gap-3">
                                    <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                                        :class="due?.is_complete ? 'bg-green-500' : 'border-2 border-gray-300'">
                                        <Icon v-if="due?.is_complete" name="ph:check"
                                            class="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <div class="grow min-w-0">
                                        <p class="text-sm transition-all"
                                            :class="due?.is_complete ? 'line-through text-gray-400' : 'text-gray-700'">
                                            {{ formatDateTimeToReadable(due?.date) }}
                                        </p>
                                        <div v-if="due?.is_complete"
                                            class="flex items-center gap-1 mt-1 text-xs text-green-700">
                                            <Icon name="ph:check-circle-fill" class="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>{{ $t('reminders.table.completed') }}</span>
                                            <template
                                                v-if="due?.completed_by?.firstname || due?.completed_by?.lastname">
                                                <span>·</span>
                                                <img v-if="due.completed_by?.profile_image"
                                                    :src="due.completed_by.profile_image"
                                                    class="w-4 h-4 rounded-full object-cover"
                                                    :alt="due.completed_by.firstname" />
                                                <span class="font-medium">
                                                    {{ due.completed_by?.firstname }}
                                                    {{ due.completed_by?.lastname }}
                                                </span>
                                            </template>
                                        </div>
                                    </div>
                                    <div class="flex-shrink-0">
                                        <Tooltip :text="$t('reminders.table.markAsComplete')"
                                            v-if="!due?.is_complete">
                                            <FormButton buttonStyle="action" buttonSize="sm"
                                                @click="markAsCompleteIncomplete(due)">
                                                <Icon name="ph:check" class="h-4 w-4" aria-hidden="true" />
                                            </FormButton>
                                        </Tooltip>
                                        <Tooltip :text="$t('reminders.table.markAsIncomplete')" v-else>
                                            <FormButton buttonStyle="action" buttonSize="sm"
                                                @click="markAsCompleteIncomplete(due)">
                                                <Icon name="ph:arrow-counter-clockwise" class="h-4 w-4"
                                                    aria-hidden="true" />
                                            </FormButton>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>

                            <div v-if="state.reminder.due_dates?.length === 0" class="text-sm text-gray-400 text-center py-4">
                                {{ $t('theresNoDataAvailableToDisplay') }}.
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { reminderService } from '@/components/api/user/ReminderService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

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
        const response = await reminderService.getReminder(props.selectedReminder?.uuid)
        if (response) {
            state.reminder = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function markAsCompleteIncomplete(due: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await reminderService.toggleReminderCompleteIncomplete({
            reminder_uuid: props.selectedReminder?.uuid,
            due_date_time: due?.date,
        })
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
