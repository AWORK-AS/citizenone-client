<template>
    <div>
        <ModalSideBySide sizeLeft="lg" sizeRight="sm" :titleLeft="$t('citizens.citizenJournals.newNote')"
            :titleRight="$t('plansandgoals.currentPlansAndGoals')" :show="props.isModalOpen"
            :showRightModal="state.modal.showCurrentPlansAndGoals" @close="closeModal"
            @closeRightModal="state.modal.showCurrentPlansAndGoals = false">
            <template #modal-left>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="flex justify-end">
                        <button class="text-sm text-primary hover:text-primary-700"
                            @click="state.modal.showCurrentPlansAndGoals = !state.modal.showCurrentPlansAndGoals"
                            v-if="state.plans?.data?.length > 0">
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
                        @closeModal="closeModal" @submitForm="saveJournal" />
                </LoadingSpinner>
            </template>
            <template #modal-right>
                <div class="space-y-5">
                    <div class="overflow-auto space-y-5" :style="computedRightModalMaxHeight">
                        <div class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary"
                            v-for="(plan, index) in state.plans?.data" :key="index">
                            <div class="flex flex-col md:flex-row md:items-center gap-3 md:gap-10">
                                <div class="grow space-y-1">
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
                                    <div>
                                        <Badge :type="plan?.is_completed ? 'active' : 'primary'" class="w-fit">
                                            <p class="text-xxs truncate">
                                                {{ plan?.is_completed ? $t('plansandgoals.completed') :
                                                    $t('plansandgoals.inProgress') }}
                                            </p>
                                        </Badge>
                                    </div>
                                    <h3 class="text-lg font-semibold">
                                        {{ plan?.name }}
                                    </h3>
                                    <div class="text-sm">
                                        <div v-html="plan?.description" class="content" />
                                    </div>
                                    <p class="text-sm">
                                        {{ $t('plansandgoals.dateCreated') }}: {{
                                            formatDateToReadable(plan?.created_at) }}
                                    </p>
                                    <p class="text-sm">
                                        <span v-if="plan?.is_completed">
                                            {{ $t('plansandgoals.dateCompleted') }}: {{
                                                formatDateToReadable(plan?.date_completed) }}
                                        </span>
                                        <span v-else>
                                            {{ $t('plansandgoals.completionDate') }}: {{
                                                formatDateToReadable(plan?.completion_date) }}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <div class="flex items-center gap-2 flex-wrap md:flex-nowrap">
                                        <FormButton class="rounded-full" buttonSize="sm" @click="viewPlan(plan)">
                                            <Icon name="ph:eye" class="size-4" />
                                            {{ $t('plansandgoals.table.actions.seeGoals') }}
                                        </FormButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="state.plans?.data?.length === 0">
                        <p class="text-center">
                            {{ $t('theresNoDataAvailableToDisplay') }}.
                        </p>
                    </div>
                    <Pagination :data="state.plans" @previous="previous" @next="next" />
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
        score: 1,
        teeth_uuid: [],
    },
    modal: {
        showCurrentPlansAndGoals: false,
    },
    plans: [] as any,
    selectedPlan: [] as any,
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
        let journal_note_plan_goal_subgoal_uuid = ''
        if (journalDetails.formJournal.journal_note_subgoal) {
            journal_note_plan_goal_subgoal_uuid = journalDetails.formJournal.journal_note_subgoal
        } else if (journalDetails.formJournal.journal_note_goal) {
            journal_note_plan_goal_subgoal_uuid = journalDetails.formJournal.journal_note_goal
        } else {
            journal_note_plan_goal_subgoal_uuid = journalDetails.formJournal.journal_note_plan
        }

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
            copy_journal_note_to_plan_or_goal_or_subgoal: journalDetails.formJournal.copy_journal_note_to_plan_or_goal_or_subgoal,
            journal_note_plan_goal_subgoal_uuid: journal_note_plan_goal_subgoal_uuid,
            copy_risk_assessment_to_plan_or_goal_or_subgoal: journalDetails.formJournal.copy_risk_assessment_to_plan_or_goal_or_subgoal,
            risk_assessment_plan_goal_subgoal_uuid: risk_assessment_plan_goal_subgoal_uuid,
            content: journalDetails.formJournal.content,
            journal_note_tags_uuid: journalDetails.formJournal.journal_note_tags,
            is_draft: journalDetails.formJournal.is_draft,
            is_ai_used: journalDetails.formJournal.is_ai_used ?? false,
            assessment: journalDetails.formJournal.assessment,
            note: journalDetails.formJournal.note,
            risk_assessment_tags_uuid: journalDetails.formJournal.risk_assessment_tags,
            score: journalDetails.formJournal.score,
            teeth_uuid: journalDetails.formJournal.teeth,
        }
        const response = await journalService.saveJournal(params)
        if (response?.data) {
            refreshJournal()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.citizenJournals.alert.successfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>