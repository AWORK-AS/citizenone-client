<template>
    <div>
        <Modal size="md" :title="$t('employment.cases.newCase')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmploymentCaseModalForm formType="create" :selectedCase="state.formCase"
                        :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveCase" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { employmentCaseService } from '@/components/api/user/EmploymentService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    citizenUuid: { type: String, required: true },
})
const emit = defineEmits(['close', 'refreshCases'])

const state = reactive({
    error: {} as Error,
    formCase: {} as any,
    isPageLoading: false,
})

function closeModal() {
    state.error = {}
    emit('close')
}

async function saveCase(details: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await employmentCaseService.saveCase({
            ...details,
            citizen_uuid: props.citizenUuid,
        })
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employment.cases.form.alert.newCaseSuccessfullySaved')}.`)
            emit('refreshCases')
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
