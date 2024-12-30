<template>
    <div>
        <Modal size="xs" :title="$t('absences.newAbsence')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesAbsenceModalForm formType="create" :selectedAbsence="state.formAbsence" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveAbsence" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { absenceService } from '@/components/api/AbsenceService'
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
})
const emit = defineEmits(['close', 'refreshAbsences'])

const state = reactive({
    error: {} as Error,
    formAbsence: {
        name: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshAbsences() {
    emit('refreshAbsences')
}

async function saveAbsence(absenceDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: absenceDetails.name,
        }
        const response = await absenceService.saveAbsence(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('absences.form.alert.newAbsenceSuccessfullySaved')}.`)
            refreshAbsences()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>