<template>
    <div>
        <Modal size="2xl" :title="$t('events.createJournalNote')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserMyCalendarNoteBookingHeader :context="state.noteContext" class="mb-4" />
                    <!-- Opened by "done" where the company requires a note first:
                         saving the note is what marks the booking done. -->
                    <p v-if="props.completeOnSave" class="mb-4 flex items-start gap-x-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800 ring-1 ring-green-200">
                        <Icon name="ph:check-circle" class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        {{ $t('events.completeOnSaveHint') }}
                    </p>
                    <Alert type="danger" :text="$t('events.noteNeedsCitizen')" v-if="!citizenUuid" />
                    <Alert type="danger" :text="state.contentError" v-if="state.contentError" />
                    <!-- The same form as a note written in the journal, so a note from
                         a booking has every option a normal note has. -->
                    <ModulesUserCitizenJournalForm v-if="citizenUuid" formType="create"
                        :selectedJournal="state.formJournal" :error="state.error" :citizenUuid="citizenUuid"
                        :bookingLinked="true" :hideDraft="props.completeOnSave" :presetCareHours="presetCareHours"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveJournal" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { hasNoteBody } from '@/composables/calendarNoteRequired'
import { myCalendarService } from '@/components/api/user/MyCalendarService'
import { journalService } from '@/components/api/user/JournalService'
import { journalNotePlanLinkParams } from '@/utils/journal-plan-link'
import { useSurveyCompletion } from '@/composables/useSurveyCompletion'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const { completeAnsweredSurveys } = useSurveyCompletion()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedEvent: {
        type: Object,
        required: true,
    },
    // Opened by "done" where the company requires a note first: the save
    // also marks the booking done (mark_completed), in one request.
    completeOnSave: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['close', 'journalCreated'])

const state = reactive({
    isPageLoading: false,
    error: {} as Error,
    contentError: '',
    noteContext: null as any,
    formJournal: {} as any,
})

// The citizen the booking is for.
const citizenUuid = computed(() => {
    const owner = props.selectedEvent?.calendar_owners?.find(
        (o: any) => o.owner_type === 'App\\Models\\Citizen'
    )
    return owner?.owner?.uuid || ''
})

// The hours start from the booking's own times.
const presetCareHours = computed(() => {
    const start = props.selectedEvent?.date_time_start
    const end = props.selectedEvent?.date_time_end
    if (!start || !end) return null
    return { start: moment(start).format('HH:mm'), end: moment(end).format('HH:mm') }
})

watch(() => props.isModalOpen, (open: boolean) => {
    if (!open || !props.selectedEvent) return
    state.error = {}
    state.contentError = ''
    state.noteContext = null
    // The note is about the visit, so it is dated when the booking started.
    state.formJournal = {
        title: props.selectedEvent.title || '',
        date: props.selectedEvent.date_time_start
            ? moment(props.selectedEvent.date_time_start).format('YYYY-MM-DD')
            : moment().format('YYYY-MM-DD'),
        content: '',
        is_draft: false,
        is_internal: false,
        assessment: null,
        note: '',
        score: '',
    }
    fetchNoteContext()
}, { immediate: true })

// The header above the form. Quiet on failure: the note can be written without it.
async function fetchNoteContext() {
    const uuid = props.selectedEvent?.uuid
    if (!uuid) return
    try {
        const response = await myCalendarService.getNoteContext(uuid)
        if (props.selectedEvent?.uuid === uuid) {
            state.noteContext = response?.data ?? null
        }
    } catch {
        state.noteContext = null
    }
}

function riskAssessmentLinkUuid(form: any): string {
    return form.risk_assessment_subgoal || form.risk_assessment_goal || form.risk_assessment_plan || ''
}

async function saveJournal(journalDetails: any) {
    const form = journalDetails.formJournal

    // "Done" needs a note with something written in it, not only the title
    // prefilled from the booking (the server refuses it too).
    state.contentError = ''
    if (props.completeOnSave && !hasNoteBody(form.content)) {
        state.contentError = t('events.noteBodyRequired')
        return
    }

    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            citizen_uuid: citizenUuid.value,
            my_calendar_uuid: props.selectedEvent?.uuid,
            title: form.title,
            date: form.date,
            ...journalNotePlanLinkParams(form),
            copy_risk_assessment_to_plan_or_goal_or_subgoal: form.copy_risk_assessment_to_plan_or_goal_or_subgoal,
            risk_assessment_plan_goal_subgoal_uuid: riskAssessmentLinkUuid(form),
            content: form.content,
            journal_note_tags_uuid: form.journal_note_tags,
            is_draft: props.completeOnSave ? false : form.is_draft,
            is_internal: form.is_internal ?? false,
            is_visible_to_patient: form.is_visible_to_patient ?? false,
            is_ai_used: form.is_ai_used ?? false,
            assessment: form.assessment,
            note: form.note,
            risk_assessment_tags_uuid: form.risk_assessment_tags,
            score: form.score,
            teeth_uuid: form.teeth,
            field_answers: form.field_answers ?? [],
            ...(journalDetails.wellbeing_scores ? { wellbeing_scores: journalDetails.wellbeing_scores } : {}),
            mentioned_user_uuids: form.mentioned_user_uuids ?? [],
            ...(journalDetails.visitAndHours ?? {}),
        }
        if (props.completeOnSave) {
            params.mark_completed = true
        }

        const response = await journalService.saveJournal(params)
        if (response?.data) {
            await completeAnsweredSurveys(response.data.uuid, journalDetails.pending_survey_answers)
            emit('journalCreated')
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t(props.completeOnSave ? 'events.alert.journalCreatedAndCompleted' : 'events.alert.journalSuccessfullyCreated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function closeModal() {
    emit('close')
}
</script>
