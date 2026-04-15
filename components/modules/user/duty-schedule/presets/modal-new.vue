<template>
    <div>
        <Modal size="md" :title="$t('dutySchedules.draft.preset.saveCurrentDraftAsPreset')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <!-- Forklaring -->
                    <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3 mb-4">
                        <svg class="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                        </svg>
                        <div>
                            <p class="text-xs font-semibold text-amber-800 mb-0.5">{{ $t('dutySchedules.draft.preset.saveInfoBox.title') }}</p>
                            <p class="text-xs text-amber-700">{{ $t('dutySchedules.draft.preset.saveInfoBox.description') }}</p>
                        </div>
                    </div>
                    <ModulesUserDutySchedulePresetsForm formType="create"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveDraftSchedulePreset" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { draftSchedulePresetService } from '@/components/api/user/DraftSchedulePresetService'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const { t } = useI18n()
const { successAlert } = useAlert()
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formDutySchedulePreset: {
        name: '',
        description: '',
        date_start: '',
        date_end: '',
    },
})

function closeModal() {
    state.error = {} as Error
    emit('close')
}

async function saveDraftSchedulePreset(draftSchedulePresetDetails: any) {
    state.isPageLoading = true
    try {
        await draftSchedulePresetService.savePreset(draftSchedulePresetDetails)
        successAlert(`${t('alert.success')}!`, `${t('dutySchedules.draft.preset.saveSuccess')}`)
        closeModal()
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>