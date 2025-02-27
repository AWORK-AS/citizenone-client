<template>
    <div>
        <Modal size="xs" :title="$t('jobSpecialties.newJobSpecialty')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserJobTitleModalForm formType="create" :selectedJobTitle="state.formJobTitle"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveJobTitle" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { jobSpecialtyService } from '@/components/api/JobSpecialtyService'
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
    selectedJobTitleUuid: {
        type: String,
        required: false,
    }
})
const emit = defineEmits(['close', 'refreshJobSpecialty'])

const state = reactive({
    error: {} as Error,
    formJobTitle: {
        title: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshJobSpecialty() {
    emit('refreshJobSpecialty')
}

async function saveJobTitle(jobTitleDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            job_title_uuid: props?.selectedJobTitleUuid,
            title: jobTitleDetails.title,
        }
        const response = await jobSpecialtyService.saveJobSpecialty(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('jobSpecialties.form.alert.newJobSpecialtySuccessfullySaved')}.`)
            refreshJobSpecialty()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>