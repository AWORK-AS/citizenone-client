<template>
    <div>
        <Modal size="sm" :title="$t('citizens.outcomes.newOutcome')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenOutcomeForm formType="create" :selectedOutcome="state.formOutcome"
                        :error="state.error" @closeModal="closeModal" @submitForm="saveOutcome" />
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
    citizenUuid: {
        type: String,
        required: true,
    },
})

const { t } = useI18n()
const emit = defineEmits(['close', 'refreshOutcomes'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formOutcome: {
        uuid: '',
        type: '',
        employer_institution: '',
        start_date: '',
        end_date: '',
        notes: '',
        billing_rule_uuid: '',
    },
})

function closeModal() {
    state.formOutcome = {
        uuid: '',
        type: '',
        employer_institution: '',
        start_date: '',
        end_date: '',
        notes: '',
        billing_rule_uuid: '',
    }
    state.error = {}
    emit('close')
}

async function saveOutcome(formData: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            citizen_uuid: props.citizenUuid,
            type: formData.type,
            employer_institution: formData.employer_institution,
            start_date: formData.start_date,
        }
        if (formData.end_date) params.end_date = formData.end_date
        if (formData.notes) params.notes = formData.notes
        if (formData.billing_rule_uuid) params.billing_rule_uuid = formData.billing_rule_uuid

        const response = await citizenOutcomeService.saveOutcome(params)
        if (response?.data) {
            emit('refreshOutcomes')
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.outcomes.alert.savedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
