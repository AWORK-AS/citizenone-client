<template>
    <div>
        <Modal size="xs" :title="$t('journalNoteTags.addNewTag')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserJournalNoteTagModalForm formType="create"
                        :selectedJournalNoteTag="state.formJournalNoteTag" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveJournalNoteTag" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { journalNoteTagService } from '@/components/api/JournalNoteTagService'
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
const emit = defineEmits(['close', 'refreshJournalNoteTags'])

const state = reactive({
    error: {} as Error,
    formJournalNoteTag: {
        name: '',
        color: '#000000',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshJournalNoteTags() {
    emit('refreshJournalNoteTags')
}

async function saveJournalNoteTag(journalNoteTagDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: journalNoteTagDetails.name,
            color: journalNoteTagDetails.color,
        }
        const response = await journalNoteTagService.saveJournalNoteTag(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('journalNoteTags.form.alert.newJournalTagSuccessfullySaved')}.`)
            refreshJournalNoteTags()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>