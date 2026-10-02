<template>
    <div>
        <ModalSideBySide sizeLeft="lg" sizeRight="sm" :titleLeft="$t('citizens.citizenJournals.newNote')"
            :titleRight="$t('plansandgoals.currentPlansAndGoals')" :show="props.isModalOpen"
            :showRightModal="state.modal.showCurrentPlansAndGoals" @close="closeModal"
            @closeRightModal="state.modal.showCurrentPlansAndGoals = false">
            <template #modal-left>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="flex justify-end">
                        <button
                            class="inline-flex items-center gap-1.5 rounded-full bg-primary-25 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-50 transition-colors"
                            @click="state.modal.showCurrentPlansAndGoals = !state.modal.showCurrentPlansAndGoals"
                            v-if="state.plans?.data?.length > 0">
                            <Icon :name="state.modal.showCurrentPlansAndGoals ? 'ph:eye-slash' : 'ph:eye'"
                                class="size-4" aria-hidden="true" />
                            <span v-if="state.modal.showCurrentPlansAndGoals">
                                {{ $t('citizens.citizenJournals.form.hideCurrentPlansGoalsAndSubgoals') }}
                            </span>
                            <span v-else>
                                {{ $t('citizens.citizenJournals.form.showCurrentPlansGoalsAndSubgoals') }}
                            </span>
                        </button>
                    </div>
                    <ModulesUserCitizenJournalForm formType="create" :selectedJournal="state.formJournal"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveJournal"
                        @planGoalSubgoalSelected="onPlanGoalSubgoalSelected" />
                </LoadingSpinner>
            </template>
            <template #modal-right>
                <div class="space-y-5">
                    <div class="overflow-auto space-y-4 pr-1" :style="computedRightModalMaxHeight">
                        <div class="group bg-white ring-1 ring-gray-200 rounded-xl p-5 transition-all hover:ring-secondary/40 hover:shadow-sm"
                            v-for="(plan, index) in visiblePlans" :key="index">
                            <div class="flex flex-col gap-4">
                                <div class="flex items-start gap-3">
                                    <div class="grow space-y-2 min-w-0">
                                        <div class="flex flex-wrap items-center gap-1.5">
                                            <Badge :type="plan?.is_completed ? 'active' : 'primary'" class="w-fit">
                                                <p class="text-xxs truncate">
                                                    {{ plan?.is_completed ? $t('plansandgoals.completed') :
                                                        $t('plansandgoals.inProgress') }}
                                                </p>
                                            </Badge>
                                            <Badge type="plans-and-goals" class="w-fit" v-if="plan?.is_plans_with_goals">
                                                <p class="text-xxs truncate">
                                                    {{ $t('plansandgoals.categories.plansAndGoals') }}
                                                </p>
                                            </Badge>
                                            <Badge type="single-goal" class="w-fit" v-if="plan?.is_single_goal">
                                                <p class="text-xxs truncate">
                                                    {{ $t('plansandgoals.categories.singleGoal') }}
                                                </p>
                                            </Badge>
                                        </div>
                                        <h3 class="text-base font-semibold text-gray-900 leading-snug">
                                            {{ plan?.name }}
                                        </h3>
                                        <div class="text-sm text-gray-600 line-clamp-3">
                                            <div v-html="plan?.description" class="content" />
                                        </div>
                                    </div>
                                    <FormButton class="rounded-full shrink-0" buttonSize="sm" @click="viewPlan(plan)">
                                        <Icon name="ph:eye" class="size-4" />
                                        {{ $t('plansandgoals.table.actions.seeGoals') }}
                                    </FormButton>
                                </div>
                                <div class="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                                    <span class="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-xxs font-medium text-gray-600">
                                        <Icon name="ph:calendar-blank" class="size-3.5 text-gray-400" aria-hidden="true" />
                                        {{ $t('plansandgoals.dateCreated') }}: {{ formatDateToReadable(plan?.created_at) }}
                                    </span>
                                    <span class="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-xxs font-medium text-gray-600">
                                        <Icon :name="plan?.is_completed ? 'ph:flag-checkered' : 'ph:flag'"
                                            class="size-3.5 text-gray-400" aria-hidden="true" />
                                        <template v-if="plan?.is_completed">
                                            {{ $t('plansandgoals.dateCompleted') }}: {{ formatDateToReadable(plan?.date_completed) }}
                                        </template>
                                        <template v-else>
                                            {{ $t('plansandgoals.completionDate') }}: {{ formatDateToReadable(plan?.completion_date) }}
                                        </template>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="visiblePlans.length === 0"
                        class="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <div class="flex size-12 items-center justify-center rounded-full bg-primary-25">
                            <Icon name="ph:target" class="size-6 text-primary/70" aria-hidden="true" />
                        </div>
                        <p class="text-sm text-gray-500">
                            {{ $t('theresNoDataAvailableToDisplay') }}.
                        </p>
                    </div>
                    <!-- Once the note is scoped to a plan/goal/sub-goal, the list above
                         is a client-side filter of the already-fetched page, not a
                         fresh query - paging through it would be misleading. -->
                    <Pagination v-if="!state.selectedContext.plan" :data="state.plans" @previous="previous"
                        @next="next" />
                </div>
                <ModulesUserCitizenPlanGoalSlideOver :isOpen="state.slideOver.isGoalOpen"
                    :selectedPlan="state.selectedPlan" @close="state.slideOver.isGoalOpen = false" />
            </template>
        </ModalSideBySide>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { planService } from '@/components/api/user/PlanService'
import { journalService } from '@/components/api/user/JournalService'
import { journalNotePlanLinkParams } from '@/utils/journal-plan-link'
import { surveyService } from '@/components/api/user/SurveyService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { formatDateToReadable } = useDatetimeFormatter()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const emit = defineEmits(['close', 'refreshJournal'])
let currentTablePage = 1

watch(() => props.isModalOpen, (newValue: any) => {
    if (newValue) {
        state.selectedContext = { plan: '', goal: '', subgoal: '' }
        fetchPlans()
    }
})

const state = reactive({
    dataFilter: [],
    error: {} as Error,
    isPageLoading: false,
    formJournal: {
        id: '',
        uuid: '',
        content: '',
        journal_note_tags: [],
        date: moment().format('YYYY-MM-DD'),
        copy_journal_note_to_plan_or_goal_or_subgoal: false,
        journal_note_plan_goal_subgoal_uuid: '',
        copy_risk_assessment_to_plan_or_goal_or_subgoal: false,
        risk_assessment_plan_goal_subgoal_uuid: '',
        title: '',
        is_draft: false,
        is_ai_used: false,
        assessment: null,
        risk_assessment_tags: [],
        note: '',
        // Empty, not 1: a pre-filled level is a score nobody chose, and it
        // reads as an assessment the author never made.
        score: '',
        teeth_uuid: [],
    },
    modal: {
        showCurrentPlansAndGoals: false,
    },
    plans: [] as any,
    selectedPlan: [] as any,
    // The Plan/Goal/Sub-goal currently picked in the note form on the left,
    // mirrored here so this panel can narrow down to it instead of always
    // showing the citizen's whole plan history. Set from the form's
    // planGoalSubgoalSelected emit, not fetched independently.
    selectedContext: {
        plan: '',
        goal: '',
        subgoal: '',
    },
    slideOver: {
        isGoalOpen: false
    },
    sortData: {
        sortField: 'completion_date',
        sortOrder: 'descend',
    },
})

function closeModal() {
    emit('close')
}

function refreshJournal() {
    emit('refreshJournal')
}

function onPlanGoalSubgoalSelected(selection: { plan: string, goal: string, subgoal: string }) {
    state.selectedContext.plan = selection?.plan ?? ''
    state.selectedContext.goal = selection?.goal ?? ''
    state.selectedContext.subgoal = selection?.subgoal ?? ''
}

// Narrows the panel down to the plan being written against, once one is
// picked in the form - a sub-goal or goal alone doesn't narrow this further
// since a plan card is the smallest unit this list renders; drilling into
// its specific goal/sub-goal still happens via "Se mål" below, which itself
// now only shows active items (see the CitizenGoalRepository/CitizenSubgoalRepository fix).
const visiblePlans = computed(() => {
    const plans = state.plans?.data ?? []
    if (!state.selectedContext.plan) {
        return plans
    }
    return plans.filter((plan: any) => plan?.uuid === state.selectedContext.plan)
})

const computedRightModalMaxHeight = computed(() => {
    const total = state.plans?.meta?.total || 0;
    return `height: ${total > 10 ? '610px' : '635px'};`;
})

async function fetchPlans() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await planService.getJournalPlanList(params)
        if (response) {
            state.plans = response
            if (state.plans?.data?.length > 0) {
                state.modal.showCurrentPlansAndGoals = true
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function previous() {
    currentTablePage--
    fetchPlans()
}

function next() {
    currentTablePage++
    fetchPlans()
}

function viewPlan(plan: any) {
    state.selectedPlan = plan
    state.slideOver.isGoalOpen = true
}

async function saveJournal(journalDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let risk_assessment_plan_goal_subgoal_uuid = ''
        if (journalDetails.formJournal.risk_assessment_subgoal) {
            risk_assessment_plan_goal_subgoal_uuid = journalDetails.formJournal.risk_assessment_subgoal
        } else if (journalDetails.formJournal.risk_assessment_goal) {
            risk_assessment_plan_goal_subgoal_uuid = journalDetails.formJournal.risk_assessment_goal
        } else {
            risk_assessment_plan_goal_subgoal_uuid = journalDetails.formJournal.risk_assessment_plan
        }

        const params = {
            citizen_uuid: citizenUuid,
            title: journalDetails.formJournal.title,
            date: journalDetails.formJournal.date,
            ...journalNotePlanLinkParams(journalDetails.formJournal),
            copy_risk_assessment_to_plan_or_goal_or_subgoal: journalDetails.formJournal.copy_risk_assessment_to_plan_or_goal_or_subgoal,
            risk_assessment_plan_goal_subgoal_uuid: risk_assessment_plan_goal_subgoal_uuid,
            content: journalDetails.formJournal.content,
            journal_note_tags_uuid: journalDetails.formJournal.journal_note_tags,
            is_draft: journalDetails.formJournal.is_draft,
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
            mentioned_user_uuids: journalDetails.formJournal.mentioned_user_uuids ?? [],
        }
        const response = await journalService.saveJournal(params)
        if (response?.data) {
            await completeAnsweredSurveys(response.data.uuid, journalDetails.pending_survey_answers)
            refreshJournal()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.citizenJournals.alert.successfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function completeAnsweredSurveys(journalUuid: string, pendingSurveyAnswers: any[]) {
    if (!Array.isArray(pendingSurveyAnswers) || pendingSurveyAnswers.length === 0) return
    for (const entry of pendingSurveyAnswers) {
        try {
            await surveyService.completeAssignment(entry.assignment_uuid, {
                answers: entry.answers,
                citizen_journal_uuid: journalUuid,
            })
        } catch (error: any) {
            // one survey failing to complete must not block the journal note itself
        }
    }
}
</script>