<template>
    <div>
        <Modal size="md"
        :title="$t('journalcontents.newjournalcontent')"
        :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserJournalContentModalForm formType="create" :selectedJournalContent="state.formJournalContent"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveJournalContent" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { journalContentService } from '@/components/api/user/JournalContentService'
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
const emit = defineEmits(['close', 'refreshJournalContents'])

const state = reactive({
    error: {} as Error,
    formJournalContent: {
        name: '',
        content: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshJournalContents() {
    emit('refreshJournalContents')
}

async function saveJournalContent(journalContentDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: journalContentDetails.name,
            content: journalContentDetails.content,
        }
        await journalContentService.saveJournalContent(params)
        successAlert(`${t('alert.success')}!`, `${t('journalcontents.form.alert.newJournalContentSuccessfullySaved')}.`)
        refreshJournalContents()
        closeModal()
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>