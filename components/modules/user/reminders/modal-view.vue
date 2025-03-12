<template>
    <div>
        <Modal size="md" :title="$t('reminders.reminder')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div v-if="state.reminder?.due_days?.length > 0" class="mt-10 mb-4 space-y-2">
                        <div v-for="(due, index) in state.reminder?.due_days" :key="index" class="bg-white shadow-md rounded-md border-l-8 mt-2 text-sm space-y-2 pr-5 pt-5 pb-5 pl-6 mr-1
                        border-yellow-500">
                            <div class="flex items-center justify-between">
                                <!-- {{ due }} -->
                                <!-- <div class="flex items-center gap-x-2">
                                    <p class="text-sm font-medium">
                                        {{ assignee.user.firstname }} {{ assignee.user.lastname }}
                                    </p>
                                </div>
                                <div class="flex items-center gap-x-4">
                                    <p class="text-sm font-semibold">
                                        {{ assignee.status.charAt(0).toUpperCase() + assignee.status.slice(1) }}
                                    </p>
                                    <div class="h-5 w-px bg-gray-300"></div>
                                    <FormButton class="rounded-md" buttonSize="sm"
                                        @click="confirmEmployeeDeletion(assignee)">
                                        <Icon name="ph:trash" class="h-4 w-4" aria-hidden="true" />
                                    </FormButton>
                                </div> -->
                            </div>
                        </div>
                    </div>
                    <div v-if="state.reminder?.due_days.length === 0" class="py-24 text-center">
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
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

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
</script>