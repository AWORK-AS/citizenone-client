<template>
    <div>
        <Modal size="4xl" :title="$t('plansandgoals.followUpNotifications')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="{ data: state.reminders }"
                            :isLoading="state.isLoading">
                            <template #body v-if="!(state.isLoading || state.reminders.length === 0)">
                                <tr v-for="(reminder, index) in state.reminders" :key="index">
                                    <td width="15%">
                                        <span>{{ formatDateToReadable(reminder?.attachment?.created_at) }}</span>
                                    </td>
                                    <td width="25%">
                                        <p>{{ reminder?.attachment?.form?.title }}</p>
                                    </td>
                                    <td width="30%">
                                        <p class="line-clamp-3">{{ reminder?.attachment?.form?.description }}</p>
                                    </td>
                                    <td width="15%">
                                        <span v-if="reminder?.attachment?.user">
                                            {{ reminder?.attachment?.user?.firstname }} {{
                                                reminder?.attachment?.user?.lastname }}
                                        </span>
                                    </td>
                                    <td width="15%">
                                        <FormButton buttonSize="sm" @click="viewReport(reminder, index)">
                                            <Icon name="ph:eye" class="size-4" />
                                            {{ $t('plansandgoals.table.actions.view') }}
                                        </FormButton>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                </div>

                <ModulesUserCitizenPlanStatusTemplateModalViewReport :isModalOpen="state.isViewReportModalOpen"
                    :report="state.selectedReport" @close="state.isViewReportModalOpen = false" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { reportService } from '@/components/api/user/ReportService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    citizenUuid: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['close', 'refreshCount'])

const state = reactive({
    columnHeaders: [
        { name: 'plansandgoals.table.dateCreated', isTranslateName: true },
        { name: 'plansandgoals.table.title', isTranslateName: true },
        { name: 'plansandgoals.table.description', isTranslateName: true },
        { name: 'plansandgoals.table.createdBy', isTranslateName: true },
        { name: '' },
    ],
    error: {} as Error,
    isLoading: false,
    isViewReportModalOpen: false,
    reminders: [] as any[],
    selectedReport: {} as any,
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, async (newValue: any) => {
    if (newValue) {
        await fetchReminders()
    }
})

async function fetchReminders() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await reportService.getUserReportFollowUpByCitizen(props.citizenUuid)
        if (response?.data) {
            state.reminders = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function viewReport(reminder: any, index: number) {
    try {
        await reportService.markReportFollowUpReminderAsViewed(reminder.uuid)
        state.reminders.splice(index, 1)
        emit('refreshCount')
    } catch (error: any) {
        state.error = error
        return
    }

    state.selectedReport = reminder?.attachment
    state.isViewReportModalOpen = true
}
</script>
