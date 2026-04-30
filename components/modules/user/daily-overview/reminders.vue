<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div v-if="activeReminders.length === 0" class="p-5">
            <div
                class="border-2 border-gray-300 border-dashed rounded-md flex flex-col items-center justify-center min-h-80 max-h-80 gap-2 text-gray-400">
                <Icon name="ph:check-circle" class="h-8 w-8" />
                <p class="text-sm">{{ $t('reminders.allCaughtUp') }}</p>
            </div>
        </div>

        <div class="divide-y overflow-y-auto min-h-96 max-h-96" v-else>
            <div v-for="reminder in activeReminders" :key="reminder.id"
                class="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <button @click="toggleComplete(reminder)"
                    :disabled="state.isToggling === reminder.id"
                    class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 disabled:opacity-50" />

                <div class="grow min-w-0">
                    <p class="text-sm font-medium text-gray-900 leading-snug truncate">{{ reminder.title }}</p>
                    <div class="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                        <Icon name="ph:calendar" class="h-3 w-3 flex-shrink-0" />
                        <span>{{ formatDateTimeToReadable(reminder.date_time) }}</span>
                    </div>
                    <div v-if="reminder.reminder_users?.length > 0" class="flex items-center mt-1.5 -space-x-1">
                        <template v-for="ru in reminder.reminder_users.slice(0, 4)" :key="ru.id">
                            <img v-if="ru.user?.profile_image"
                                :src="ru.user.profile_image"
                                :title="`${ru.user?.firstname} ${ru.user?.lastname}`"
                                class="w-5 h-5 rounded-full object-cover border border-white" />
                            <div v-else
                                :title="`${ru.user?.firstname} ${ru.user?.lastname}`"
                                class="w-5 h-5 rounded-full bg-primary flex items-center justify-center border border-white text-white text-xxs font-medium">
                                {{ ru.user?.firstname?.[0] }}{{ ru.user?.lastname?.[0] }}
                            </div>
                        </template>
                        <span v-if="reminder.reminder_users.length > 4" class="text-xs text-gray-400 pl-2">
                            +{{ reminder.reminder_users.length - 4 }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { reminderService } from '@/components/api/user/ReminderService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

const { formatDateTimeToReadable } = useDatetimeFormatter()

const state = reactive({
    isPageLoading: false,
    isToggling: null as number | null,
    reminders: [] as any[],
    error: {} as Error,
})

const activeReminders = computed(() =>
    state.reminders.filter((r: any) => !r?.due_dates?.[0]?.is_complete)
)

onMounted(() => {
    fetchReminders()
})

async function fetchReminders() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await reminderService.getReminders()
        if (response) {
            state.reminders = response.data ?? []
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function toggleComplete(reminder: any) {
    state.isToggling = reminder.id
    try {
        const dueDate = reminder?.due_dates?.[0]
        await reminderService.toggleReminderCompleteIncomplete({
            reminder_uuid: reminder.uuid,
            due_date_time: dueDate?.date || reminder.date_time,
        })
        await fetchReminders()
    } catch (error: any) {
        state.error = error
    }
    state.isToggling = null
}
</script>
