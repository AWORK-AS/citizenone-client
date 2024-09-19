<template>
    <div>
        <Modal size="xs" :title="$t('jobTitles.newJobTitle')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesJobTitleModalForm formType="create" :selectedJobTitle="state.formJobTitle"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveJobTitle" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { jobTitleService } from '@/components/api/JobTitleService'
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
const emit = defineEmits(['close', 'refreshJobTitle'])

const state = reactive({
    error: {} as Error,
    formJobTitle: {
        name: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshJobTitle() {
    emit('refreshJobTitle')
}

async function saveJobTitle(jobTitleDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: jobTitleDetails.name,
        }
        const response = await jobTitleService.saveJobTitle(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('jobTitles.form.alert.newJobTitleSuccessfullySaved')}.`)
            refreshJobTitle()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>