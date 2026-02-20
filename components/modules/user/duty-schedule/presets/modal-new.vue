<template>
    <div>
        <Modal size="md" :title="$t('dutySchedules.draft.preset.saveCurrentDraftAsPreset')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
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