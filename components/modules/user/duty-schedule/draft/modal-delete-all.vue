<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.draft.deleteAll.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isLoading">
                    <div class="space-y-4">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <svg class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p class="text-sm text-red-700">{{ $t('dutySchedules.draft.deleteAll.confirmation') }}</p>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="danger" @click="handleDeleteAll">
                                {{ $t('dutySchedules.draft.deleteAll.button') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { draftScheduleService } from '@/components/api/user/DraftScheduleService'
import type { Error } from '@/types'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'deleted'])
const { t } = useI18n()
const { successAlert } = useAlert()

const state = reactive({
    isLoading: false,
    error: {} as Error,
})

watch(() => props.isModalOpen, () => {
    state.error = {}
})

function closeModal() {
    emit('close')
}

async function handleDeleteAll() {
    state.isLoading = true
    state.error = {}
    try {
        await draftScheduleService.deleteAllCompanyDraftSchedules()
        successAlert(`${t('alert.success')}!`, `${t('dutySchedules.draft.deleteAll.successAlert')}`)
        emit('deleted')
        closeModal()
    } catch (error: any) {
        state.error = error
    } finally {
        state.isLoading = false
    }
}
</script>
