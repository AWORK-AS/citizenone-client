<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('reminder.reminders') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('reminder.reminders') }}</template>

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="state.modal.isNewTaskOpen = !state.modal.isNewTaskOpen">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('reminder.newReminder') }}
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
                                <p class="text-sm">
                                    {{ $t('reminder.dueDate') }}: {{
                                        formatDateToReadable(reminder?.date_time) }}
                                </p>
                                <p class="text-sm">
                                    {{ $t('reminder.time') }}: {{
                                        formatTimeToReadable(reminder?.date_time) }} - {{ reminder?.repeat }}
                                </p>
                            </div>
                            <div>
                                <div class="flex items-center gap-2 flex-wrap md:flex-nowrap">
                                    <FormButton class="rounded-md min-w-36" buttonSize="sm"
                                        @click="openView(reminder?.uuid)">
                                        <Icon name="ph:user-plus" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('reminder.Assignees') }}
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
            <ModulesRemindersModalNew :isModalOpen="state.modal.isNewTaskOpen" :selectedReminder="state.reminders"
                @close="state.modal.isNewTaskOpen = false" @refreshReminders="fetchReminders()" />
            <ModulesRemindersModalView :isModalOpen="state.modal.isAssignReminderOpen"
                @close="state.modal.isAssignReminderOpen = false" :reminder_uuid="state.modal.selectedReminderUuid" />

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useI18n } from "vue-i18n"
import { useAlert } from "@/composables/alert"
import { useRuntimeConfig } from "#imports"
import { reminderService } from '@/components/api/ReminderService'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

let currentTablePage = 1

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    reminders: [] as any,
    modal: {
        isNewTaskOpen: false,
        isAssignReminderOpen: false,
        selectedReminderUuid: '',
    },
});

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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

function formatTimeToReadable(dateTime: string) {
    if (!dateTime) return ''

    const timePart = dateTime.split(' ')[1]

    if (!timePart) return ''

    const [hours, minutes, seconds] = timePart.split(':').map(Number)

    const date = new Date();
    date.setHours(hours, minutes, seconds);

    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}
function openView(reminderUuid: string) {
    state.modal.selectedReminderUuid = reminderUuid
    state.modal.isAssignReminderOpen = true;
}



</script>
