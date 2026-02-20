<template>
    <div>
        <Modal size="md" :title="$t('dutySchedules.draft.preset.editDraftSchedulePreset')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutySchedulePresetsFormEdit formType="update"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value" :selectedPreset="props.selectedPreset"
                        @closeModal="closeModal" @submitForm="updateDraftSchedulePreset" />
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
    selectedPreset: {
        type: Object,
        required: true,
    },
})

const { t } = useI18n()
const { successAlert } = useAlert()
const emit = defineEmits(['close', 'refreshPresets'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formDutySchedulePreset: {
        name: '',
        description: '',
    },
})

function closeModal() {
    emit('close')
}

async function updateDraftSchedulePreset(draftSchedulePresetDetails: any) {
    state.isPageLoading = true
    try {
        await draftSchedulePresetService.updatePreset(props.selectedPreset.uuid, draftSchedulePresetDetails)
        successAlert(`${t('alert.success')}!`, `${t('dutySchedules.draft.preset.updateSuccess')}`)
        emit('refreshPresets')
        closeModal()
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>