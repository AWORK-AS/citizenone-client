<template>
    <div>
        <Modal size="lg" :title="$t('citizens.citizenJournals.editNote')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenJournalForm formType="update" :selectedJournal="props.selectedJournal"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateJournal" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { journalService } from '@/components/api/user/JournalService'
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
    selectedJournal: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshJournal'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshJournal() {
    emit('refreshJournal')
}

async function updateJournal(journalDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const journalUuid = journalDetails.formJournal.uuid
        const params = {
            title: journalDetails.formJournal.title,
            date: journalDetails.formJournal.date,
            content: journalDetails.formJournal.content,
            journal_note_tags_uuid: journalDetails.formJournal.journal_note_tags,
            is_draft: journalDetails.formJournal.is_draft,
            assessment: journalDetails.formJournal.assessment,
            note: journalDetails.formJournal.note,
            risk_assessment_tags_uuid: journalDetails.formJournal.risk_assessment_tags,
            score: journalDetails.formJournal.score,
            teeth_uuid: journalDetails.formJournal.teeth,
        }
        const response = await journalService.updateJournal(journalUuid, params)
        if (response?.data) {
            refreshJournal()
            if (!journalDetails.isAutoSaving) {
                closeModal()
                successAlert(`${t('alert.success')}!`, `${t('citizens.citizenJournals.alert.successfullyUpdated')}.`)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>