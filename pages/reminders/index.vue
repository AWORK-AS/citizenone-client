<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('reminders.reminders') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('reminders.reminders') }}</template>

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="state.modal.isNewTaskOpen = !state.modal.isNewTaskOpen">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('reminders.newReminder') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <div class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary"
                        v-for="(reminder, index) in state.reminders?.data" :key="index">
                        <div class="flex flex-col md:flex-row md:items-center gap-3 md:gap-10">
                            <div class="grow space-y-1">
                                <div class="flex items-center gap-x-2">
                                    <h3 class="text-lg font-semibold">
                                        {{ reminder?.title }}
                                    </h3>
                                </div>
                                <div class="text-sm">
                                    <div v-html="reminder?.notes" class="content" />
                                </div>
                                <Badge type="primary" class="w-fit">
                                    <p class="text-xs">
                                        {{ $t('reminders.table.dueDate') }}: {{
                                            formatDateToReadable(reminder?.date_time)
                                        }}
                                    </p>
                                </Badge>
                                <Badge type="primary" class="w-fit">
                                    <p class="text-xs">
                                        {{ $t('reminders.table.time') }}: {{ formatTimeToReadable(reminder?.date_time)
                                        }}
                                        ~ {{
                                            reminder?.repeat
                                        }}
                                    </p>
                                </Badge>
                            </div>
                            <div>
                                <div class="flex items-center gap-2 flex-wrap md:flex-nowrap">
                                    <FormButton class="rounded-md" buttonSize="sm" @click="viewReminder(reminder)">
                                        <Icon name="ph:eye" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('reminders.table.actions.view') }}
                                    </FormButton>
                                    <FormButton class="rounded-md" buttonSize="sm" @click="editReminder(reminder)">
                                        <Icon name="ph:pencil" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('reminders.table.actions.edit') }}
                                    </FormButton>
                                    <FormButton class="rounded-md" buttonSize="sm"
                                        @click="deleteReminderConfirmation(reminder)">
                                        <Icon name="ph:trash" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('reminders.table.actions.delete') }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="state.reminders?.data?.length === 0">
                        <p class="text-center">
                            {{ $t('theresNoDataAvailableToDisplay') }}.
                        </p>
                    </div>
                </div>
            </div>
            <ModulesUserRemindersModalNew :isModalOpen="state.modal.isNewTaskOpen"
                @close="state.modal.isNewTaskOpen = false" @refreshReminders="fetchReminders()" />
            <ModulesUserRemindersModalEdit :isModalOpen="state.modal.isEditReminderOpen"
                :selectedReminder="state.selectedReminder" @close="state.modal.isEditReminderOpen = false"
                @refreshReminders="fetchReminders()" />
            <ModulesUserRemindersModalView :isModalOpen="state.modal.isViewReminderOpen"
                :selectedReminder="state.selectedReminder" @close="state.modal.isViewReminderOpen = false" />
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
    reminders: [] as any,
    modal: {
        isNewTaskOpen: false,
        isDeleteAssignReminderOpen: false,
        isEditReminderOpen: false,
        isViewReminderOpen: false,
    },
    selectedReminder: {} as any,
})

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