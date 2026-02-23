<template>
    <div>
        <Modal size="xs" :title="$t('events.delete')" :show="props.isModalOpen" @close="emit('close')">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="mt-4">
                        <p>{{ t('events.confirmation.deleteConfirmation') + '?' }}</p>
                    </div>
                    <div class="space-y-3 py-4" v-if="props.selectedSchedule.is_recurring">
                        <div class="w-fit flex items-center cursor-pointer"
                            @click="state.isDeleteFutureEvents = !state.isDeleteFutureEvents">
                        <FormCheckbox id="delete_future_events" :value="state.isDeleteFutureEvents" />
                        {{ $t('events.confirmation.deleteFutureEvents') }}
                    </div>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md col-start-1"
                                @click="emit('close')">
                                {{ $t('close') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="danger" class="rounded-md col-start-2"
                               @click="emit('deleteMyCalendarEvent', state.isDeleteFutureEvents)">
                                {{ $t('events.delete') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
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
    selectedSchedule: {
        type: Object,
        required: true,
    }
})
const emit = defineEmits(['close', 'deleteMyCalendarEvent'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isDeleteFutureEvents: false,
})
</script>