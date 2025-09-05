<template>
    <div>
        <Modal size="xs" :title="$t('journalTitles.newJournalTitle')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserJournalTitleModalForm formType="create" :selectedJournalTitle="state.formJournalTitle"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveJournalTitle" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { journalTitleService } from '@/components/api/user/JournalTitleService'
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
const emit = defineEmits(['close', 'refreshJournalTitles'])

const state = reactive({
    error: {} as Error,
    formJournalTitle: {
        title: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshJournalTitles() {
    emit('refreshJournalTitles')
}

async function saveJournalTitle(journalTitleDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            title: journalTitleDetails.title,
        }
        const response = await journalTitleService.saveJournalTitle(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('journalTitles.form.alert.newJournalTitleSuccessfullySaved')}.`)
            refreshJournalTitles()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>