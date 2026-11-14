<template>
    <div>
        <Modal size="lg"
            :title="props.readonly ? $t('citizens.citizenJournals.viewNote') : $t('citizens.citizenJournals.editNote')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenJournalForm formType="update" :selectedJournal="props.selectedJournal"
                        :readonly="props.readonly" :error="state.error" :citizenUuid="props.citizenUuid"
                        :bookingLinked="props.selectedJournal?.is_from_booking === true"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateJournal" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { journalService } from '@/components/api/user/JournalService'
import { useSurveyCompletion } from '@/composables/useSurveyCompletion'
import { journalNotePlanLinkParams } from '@/utils/journal-plan-link'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { completeAnsweredSurveys } = useSurveyCompletion()
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
    readonly: {
        type: Boolean,
        default: false,
    },
    /**
     * The note's citizen, for pages that are not a citizen's own (the journal
     * notes overview). Without it the form has no citizen to load plans and
     * goals for. Citizen pages leave it out and the form reads the route.
     */
    citizenUuid: {
        type: String,
        default: null,
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
    if (props.readonly) return
    state.error = {}
    state.isPageLoading = true
    try {
        const journalUuid = journalDetails.formJournal.uuid
        const params = {
            title: journalDetails.formJournal.title,
            date: journalDetails.formJournal.date,
            content: journalDetails.formJournal.content,
            ...journalNotePlanLinkParams(journalDetails.formJournal, true),
            journal_note_tags_uuid: journalDetails.formJournal.journal_note_tags,
            is_draft: journalDetails.formJournal.is_draft,
            is_internal: journalDetails.formJournal.is_internal ?? false,
            is_visible_to_patient: journalDetails.formJournal.is_visible_to_patient ?? false,
            is_ai_used: journalDetails.formJournal.is_ai_used ?? false,
            assessment: journalDetails.formJournal.assessment,
            note: journalDetails.formJournal.note,
            risk_assessment_tags_uuid: journalDetails.formJournal.risk_assessment_tags,
            score: journalDetails.formJournal.score,
            teeth_uuid: journalDetails.formJournal.teeth,
            field_answers: journalDetails.formJournal.field_answers ?? [],
            // Present only when the form showed the wellbeing ruler.
            ...(journalDetails.wellbeing_scores ? { wellbeing_scores: journalDetails.wellbeing_scores } : {}),
            // Visit date and intervention hours (journal form).
            ...(journalDetails.visitAndHours ?? {}),
        }
        const response = await journalService.updateJournal(journalUuid, params)
        if (response?.data) {
            if (!journalDetails.isAutoSaving) {
                await completeAnsweredSurveys(journalUuid, journalDetails.pending_survey_answers)
            }
            refreshJournal()
            if (!journalDetails.isAutoSaving) {
                closeModal()
                successAlert(`${t('alert.success')}!`, `${t('citizens.citizenJournals.alert.successfullyUpdated')}.`)
            }
        }
        journalDetails.done?.(true)
    } catch (error: any) {
        state.error = error
        journalDetails.done?.(false)
    }
    state.isPageLoading = false
}

</script>