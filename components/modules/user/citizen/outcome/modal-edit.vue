<template>
    <div>
        <Modal size="sm" :title="$t('citizens.outcomes.editOutcome')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenOutcomeForm formType="update" :selectedOutcome="state.formOutcome"
                        :error="state.error" @closeModal="closeModal" @submitForm="updateOutcome" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { citizenOutcomeService } from '@/components/api/user/CitizenOutcomeService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedOutcome: {
        type: Object,
        required: true,
    },
})

const { t } = useI18n()
const emit = defineEmits(['close', 'refreshOutcomes'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formOutcome: {} as any,
})

watch(() => props.selectedOutcome, (newValue: any) => {
    if (newValue) {
        state.formOutcome = {
            uuid: newValue.uuid,
            type: newValue.type,
            employer_institution: newValue.employer_institution,
            start_date: newValue.start_date,
            end_date: newValue.end_date || '',
            notes: newValue.notes || '',
            billing_rule_uuid: newValue.billing_rule?.uuid || '',
        }
    }
}, { immediate: true })

function closeModal() {
    state.error = {}
    emit('close')
}

async function updateOutcome(formData: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            type: formData.type,
            employer_institution: formData.employer_institution,
            start_date: formData.start_date,
            end_date: formData.end_date || null,
            notes: formData.notes || null,
        }
        if (formData.billing_rule_uuid) params.billing_rule_uuid = formData.billing_rule_uuid

        const response = await citizenOutcomeService.updateOutcome(state.formOutcome.uuid, params)
        if (response?.data) {
            emit('refreshOutcomes')
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.outcomes.alert.updatedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
