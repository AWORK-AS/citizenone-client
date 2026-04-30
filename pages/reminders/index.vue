<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('reminders.reminders') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('reminders.reminders') }}</template>

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="state.modal.isNewTaskOpen = !state.modal.isNewTaskOpen">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('reminders.newReminder') }}
                    </FormButton>
                </div>

                <div class="bg-white ring-1 ring-gray-200 rounded-xl">
                    <div v-if="activeReminders.length === 0 && completedReminders.length === 0"
                        class="py-16 text-center text-gray-400">
                        {{ $t('theresNoDataAvailableToDisplay') }}.
                    </div>

                    <!-- Active reminders -->
                    <div v-for="(reminder, index) in activeReminders" :key="reminder.id"
                        :class="index > 0 ? 'border-t border-gray-100' : ''">
                        <div class="flex items-start gap-4 px-5 py-4">
                            <button @click="toggleComplete(reminder)"
                                :disabled="state.isToggling === reminder.id"
                                class="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 disabled:opacity-50" />
                            <div class="grow min-w-0">
                                <h3 class="text-base font-semibold text-gray-900 leading-snug">
                                    {{ reminder?.title }}
                                </h3>
                                <div v-if="reminder?.notes" v-html="reminder?.notes"
                                    class="content text-sm text-gray-500 mt-0.5" />
                                <div class="flex flex-wrap gap-1.5 mt-2">
                                    <span
                                        class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                        <Icon name="ph:calendar" class="h-3 w-3" />
                                        {{ formatDateToReadable(reminder?.date_time) }}
                                    </span>
                                    <span
                                        class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                        <Icon name="ph:clock" class="h-3 w-3" />
                                        {{ formatTimeToReadable(reminder?.date_time) }}
                                        <template v-if="reminder?.repeat && reminder.repeat !== 'never'">
                                            · {{ reminder.repeat }}
                                        </template>
                                    </span>
                                </div>
                            </div>
                            <div class="flex items-center gap-1.5 flex-shrink-0">
                                <Tooltip :text="$t('reminders.table.actions.view')">
                                    <FormButton buttonStyle="action" buttonSize="sm" @click="viewReminder(reminder)">
                                        <Icon name="ph:eye" class="h-4 w-4" aria-hidden="true" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="$t('reminders.table.actions.edit')">
                                    <FormButton buttonStyle="action" buttonSize="sm" @click="editReminder(reminder)">
                                        <Icon name="ph:pencil-simple" class="h-4 w-4" aria-hidden="true" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="$t('reminders.table.actions.delete')">
                                    <FormButton buttonStyle="action" buttonSize="sm" @click="deleteReminderConfirmation(reminder)">
                                        <Icon name="ph:trash" class="h-4 w-4" aria-hidden="true" />
                                    </FormButton>
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    <!-- Completed section -->
                    <div v-if="completedReminders.length > 0" class="rounded-b-xl overflow-hidden">
                        <button @click="state.showCompleted = !state.showCompleted"
                            class="w-full flex items-center gap-2 px-5 py-3 bg-gray-50 border-t border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                            <Icon :name="state.showCompleted ? 'ph:caret-down' : 'ph:caret-right'"
                                class="h-4 w-4" />
                            {{ $t('reminders.table.completed') }} ({{ completedReminders.length }})
                        </button>
                        <template v-if="state.showCompleted">
                            <div v-for="(reminder, index) in completedReminders" :key="reminder.id"
                                class="border-t border-gray-100 bg-gray-50/60">
                                <div class="flex items-start gap-4 px-5 py-4">
                                    <button @click="toggleComplete(reminder)"
                                        :disabled="state.isToggling === reminder.id"
                                        class="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-green-500 border-2 border-green-500 hover:bg-green-600 flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 disabled:opacity-50">
                                        <Icon name="ph:check" class="h-3.5 w-3.5 text-white" />
                                    </button>
                                    <div class="grow min-w-0">
                                        <h3 class="text-base font-semibold line-through text-gray-400 leading-snug">
                                            {{ reminder?.title }}
                                        </h3>
                                        <div class="flex items-center gap-1 mt-1 text-xs text-green-600">
                                            <Icon name="ph:check-circle-fill" class="h-3.5 w-3.5" />
                                            <span>{{ $t('reminders.table.completed') }}</span>
                                            <template v-if="getCompletedByName(reminder)">
                                                <span>·</span>
                                                <span class="font-medium">{{ getCompletedByName(reminder) }}</span>
                                            </template>
                                        </div>
                                        <div class="flex flex-wrap gap-1.5 mt-2">
                                            <span
                                                class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                                                <Icon name="ph:calendar" class="h-3 w-3" />
                                                {{ formatDateToReadable(reminder?.date_time) }}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-1.5 flex-shrink-0">
                                        <Tooltip :text="$t('reminders.table.actions.view')">
                                            <FormButton buttonStyle="action" buttonSize="sm" @click="viewReminder(reminder)">
                                                <Icon name="ph:eye" class="h-4 w-4" aria-hidden="true" />
                                            </FormButton>
                                        </Tooltip>
                                        <Tooltip :text="$t('reminders.table.actions.edit')">
                                            <FormButton buttonStyle="action" buttonSize="sm" @click="editReminder(reminder)">
                                                <Icon name="ph:pencil-simple" class="h-4 w-4" aria-hidden="true" />
                                            </FormButton>
                                        </Tooltip>
                                        <Tooltip :text="$t('reminders.table.actions.delete')">
                                            <FormButton buttonStyle="action" buttonSize="sm" @click="deleteReminderConfirmation(reminder)">
                                                <Icon name="ph:trash" class="h-4 w-4" aria-hidden="true" />
                                            </FormButton>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>

            <ModulesUserRemindersModalNew :isModalOpen="state.modal.isNewTaskOpen"
                @close="state.modal.isNewTaskOpen = false" @refreshReminders="fetchReminders()" />
            <ModulesUserRemindersModalEdit :isModalOpen="state.modal.isEditReminderOpen"
                :selectedReminder="state.selectedReminder" @close="state.modal.isEditReminderOpen = false"
                @refreshReminders="fetchReminders()" />
            <ModulesUserRemindersModalView :isModalOpen="state.modal.isViewReminderOpen"
                :selectedReminder="state.selectedReminder" @close="state.modal.isViewReminderOpen = false"
                @refreshReminders="fetchReminders()" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteAssignReminderOpen"
                :message="$t('reminders.table.confirmation.deleteReminderConfirmation') + '?'"
                @close="state.modal.isDeleteAssignReminderOpen = false" @confirm="deleteReminder" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from "#imports"
import { reminderService } from '@/components/api/user/ReminderService'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isToggling: null as number | null,
    showCompleted: false,
    reminders: [] as any,
    modal: {
        isNewTaskOpen: false,
        isDeleteAssignReminderOpen: false,
        isEditReminderOpen: false,
        isViewReminderOpen: false,
    },
    selectedReminder: {} as any,
})

const activeReminders = computed(() =>
    (state.reminders?.data || []).filter((r: any) => !isReminderComplete(r))
)

const completedReminders = computed(() =>
    (state.reminders?.data || []).filter((r: any) => isReminderComplete(r))
)

function isReminderComplete(reminder: any): boolean {
    return reminder?.due_dates?.[0]?.is_complete ?? false
}

function getCompletedByName(reminder: any): string | null {
    const completedBy = reminder?.due_dates?.[0]?.completed_by
    if (!completedBy) return null
    if (typeof completedBy === 'string') return completedBy
    const name = [completedBy?.firstname, completedBy?.lastname].filter(Boolean).join(' ')
    return name || null
}

async function toggleComplete(reminder: any) {
    state.isToggling = reminder.id
    try {
        const dueDate = reminder?.due_dates?.[0]
        const params = {
            reminder_uuid: reminder?.uuid,
            due_date_time: dueDate?.date || reminder?.date_time,
        }
        await reminderService.toggleReminderCompleteIncomplete(params)
        await fetchReminders()
    } catch (error: any) {
        state.error = error
    }
    state.isToggling = null
}

async function fetchReminders() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await reminderService.getReminders()
        if (response) {
            state.reminders = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

onMounted(() => {
    fetchReminders()
})

const formatDateToReadable = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

function formatTimeToReadable(dateTime: string) {
    if (!dateTime) return ''

    const timePart = dateTime.split(' ')[1]

    if (!timePart) return ''

    const [hours, minutes, seconds] = timePart.split(':').map(Number)

    const date = new Date()
    date.setHours(hours, minutes, seconds)

    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date)
}

function viewReminder(reminder: any) {
    state.selectedReminder = reminder
    state.modal.isViewReminderOpen = true
}

function editReminder(reminder: any) {
    state.selectedReminder = reminder
    state.modal.isEditReminderOpen = true
}

function deleteReminderConfirmation(reminder: any) {
    state.selectedReminder = reminder
    state.modal.isDeleteAssignReminderOpen = true
}

async function deleteReminder() {
    state.error = {}
    state.isPageLoading = true
    try {
        const reminderUuid = state.selectedReminder?.uuid
        const response = await reminderService.deleteReminder(reminderUuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('reminders.table.alert.reminderSuccessfullyDeleted')}.`)
            fetchReminders()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
