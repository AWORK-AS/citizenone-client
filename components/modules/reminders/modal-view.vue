<template>
    <div>
        <Modal size="md" :title="$t('reminder.Assignees')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div v-if="state.assignees.length > 0" class="mt-4 space-y-2">
                    <div v-for="assignee in state.assignees" :key="assignee.id"
                        class="bg-white shadow-md rounded-md border-l-8 mt-2 text-sm space-y-2 pr-5 pt-5 pb-5 pl-6 mr-1"
                        :class="{
                            'border-green-600': assignee.status === 'completed',
                            'border-yellow-500': assignee.status === 'pending',
                            'border-red-600': assignee.status === 'failed'
                        }">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-x-2">
                                <p class="text-sm font-medium">
                                    {{ assignee.user.firstname }} {{ assignee.user.lastname }}
                                </p>
                            </div>
                            <div class="flex items-center gap-x-4">
                                <p class="text-sm font-semibold">
                                    {{ assignee.status.charAt(0).toUpperCase() + assignee.status.slice(1) }}
                                </p>
                                <div class="h-5 w-px bg-gray-300"></div>
                                <FormButton class="rounded-md" buttonSize="sm" @click="removeAssignee(assignee.uuid)">
                                    <Icon name="ph:trash" class="h-4 w-4" aria-hidden="true" />
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Modal>
    </div>

</template>

<script setup lang="ts">
import { watch, reactive } from 'vue'
import { reminderUserService } from '@/components/api/ReminderUserService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'

const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    error: {} as Error,
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    reminder_uuid: {
        type: String,
        required: false,
        default: null
    }
})

const state = reactive({
    reminder_uuid: '',
    assignees: [] as any[],
    isLoading: false
})

const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}

watch(() => props.reminder_uuid, (newUuid) => {
    if (newUuid) {
        state.reminder_uuid = "?reminder_uuid=" + newUuid;
        fetchAssignees();
    }
}, { immediate: true });

async function fetchAssignees() {
    try {
        state.isLoading = true;
        const response = await reminderUserService.getReminderUser(state.reminder_uuid);

        if (response?.data) {
            state.assignees = response.data;
        } else {
            state.assignees = [];
        }
    } catch (error: any) {
        state.assignees = [];
    } finally {
        state.isLoading = false;
    }
}

async function removeAssignee(Uuid: string) {
    try {
        state.isLoading = true;
        const response = await reminderUserService.deleteReminderUser(Uuid);

        if (response && response.message) {
            closeModal();
            fetchAssignees()
        }

    } catch (error: any) {
        state.assignees = [];
    } finally {
        state.isLoading = false;
    }
}

</script>
