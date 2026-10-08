<template>
    <div>
        <Modal size="xs" :title="$t('events.delete')" :show="props.isModalOpen" @close="emit('close')">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="mt-4">
                        <p>{{ t('events.confirmation.deleteConfirmation') + '?' }}</p>
                    </div>
                    <div class="py-4" v-if="props.selectedSchedule.is_recurring">
                        <ModulesUserMyCalendarRecurringScope v-model="state.deleteScope"
                            :label="$t('events.recurringScope.deleteLabel')" />
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md col-start-1"
                                @click="emit('close')">
                                {{ $t('close') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="danger" class="rounded-md col-start-2"
                               @click="emit('deleteMyCalendarEvent', state.deleteScope)">
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
    deleteScope: 'this' as 'this' | 'this_and_following' | 'all',
})

// The parent keeps this component mounted and only toggles isModalOpen, so the
// choice would otherwise stay on "all" from a previous delete and silently take
// the whole series with the next single-occurrence delete.
watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen) {
        state.deleteScope = 'this'
    }
})
</script>