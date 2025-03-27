<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('plansandgoals.forCompletion.managePendingPlansGoalsandSubgoals') }} - {{
                        runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('plansandgoals.forCompletion.hereAreThePlansGoalsAndSubgoalsThatReachedTheDeadline') }}
            </template>

            <div class="min-h-44 space-y-3">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-5" v-if="state.pendingPlansGoalsSubgoals?.data?.length > 0">
                        <div class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary"
                            v-for="(pendingPlanGoalSubgoal, index) in state.pendingPlansGoalsSubgoals?.data"
                            :key="index">
                            <div class="flex flex-col md:flex-row md:items-center gap-3 md:gap-10">
                                <div class="grow space-y-1">
                                    <Badge type="plans-and-goals" class="w-fit"
                                        v-if="pendingPlanGoalSubgoal?.type === 'Plan'">
                                        <p class="text-xxs truncate">
                                            {{ $t('plansandgoals.forCompletion.plan') }}
                                        </p>
                                    </Badge>
                                    <Badge type="plans-and-goals" class="w-fit"
                                        v-if="pendingPlanGoalSubgoal?.type === 'Goal'">
                                        <p class="text-xxs truncate">
                                            {{ $t('plansandgoals.forCompletion.goal') }}
                                        </p>
                                    </Badge>
                                    <Badge type="plans-and-goals" class="w-fit"
                                        v-if="pendingPlanGoalSubgoal?.type === 'Subgoal'">
                                        <p class="text-xxs truncate">
                                            {{ $t('plansandgoals.forCompletion.subgoal') }}
                                        </p>
                                    </Badge>
                                    <div class="flex items-center gap-x-2">
                                        <div>
                                            <Badge type="primary">
                                                <p class="text-xxs truncate">
                                                    {{ $t('plansandgoals.inProgress') }}
                                                </p>
                                            </Badge>
                                        </div>
                                        <h3 class="text-lg font-semibold">
                                            {{ pendingPlanGoalSubgoal?.name }}
                                        </h3>
                                    </div>
                                    <div class="text-sm">
                                        <div v-html="pendingPlanGoalSubgoal?.description" class="content" />
                                    </div>
                                    <div class="mt-1">
                                        <Badge type="primary" class="w-fit" v-if="pendingPlanGoalSubgoal.score">
                                            <p class="text-xxs" v-if="pendingPlanGoalSubgoal.score == 1">
                                                {{
                                                    $t('plansandgoals.table.expectedLevels.minorChallenges')
                                                }}
                                            </p>
                                            <p class="text-xxs" v-if="pendingPlanGoalSubgoal.score == 2">
                                                {{
                                                    $t('plansandgoals.table.expectedLevels.moderateChallenges')
                                                }}
                                            </p>
                                            <p class="text-xxs" v-if="pendingPlanGoalSubgoal.score == 3">
                                                {{
                                                    $t('plansandgoals.table.expectedLevels.significantChallenges')
                                                }}
                                            </p>
                                            <p class="text-xxs" v-if="pendingPlanGoalSubgoal.score == 4">
                                                {{
                                                    $t('plansandgoals.table.expectedLevels.severeChallenges')
                                                }}
                                            </p>
                                            <p class="text-xxs" v-if="pendingPlanGoalSubgoal.score == 5">
                                                {{
                                                    $t('plansandgoals.table.expectedLevels.verySubstantialChallenges')
                                                }}
                                            </p>
                                        </Badge>
                                    </div>
                                    <p class="text-sm">
                                        {{ $t('plansandgoals.dateCreated') }}: {{
                                            formatDateToReadable(pendingPlanGoalSubgoal?.created_at) }}
                                    </p>
                                    <p class="text-sm">
                                        <span>
                                            {{ $t('plansandgoals.completionDate') }}: {{
                                                formatDateToReadable(pendingPlanGoalSubgoal?.completion_date) }}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <div class="flex items-center gap-2 flex-wrap md:flex-nowrap"
                                        v-if="pendingPlanGoalSubgoal?.type === 'Plan'">
                                        <Tooltip :text="$t('plansandgoals.forCompletion.extendDeadline')">
                                            <FormButton class="rounded-md" buttonSize="sm"
                                                @click="markPlanAsCompletedConfirmation(pendingPlanGoalSubgoal)">
                                                <Icon name="ph:check" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                        <Tooltip :text="$t('plansandgoals.forCompletion.extendDeadline')">
                                            <FormButton class="rounded-md" buttonSize="sm"
                                                @click="extendPlan(pendingPlanGoalSubgoal)">
                                                <Icon name="ph:arrows-out" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                    </div>
                                    <div class="flex items-center gap-2 flex-wrap md:flex-nowrap"
                                        v-if="pendingPlanGoalSubgoal?.type === 'Goal'">
                                        <Tooltip :text="$t('plansandgoals.forCompletion.extendDeadline')">
                                            <FormButton class="rounded-md" buttonSize="sm"
                                                @click="markGoalAsCompletedConfirmation(pendingPlanGoalSubgoal)">
                                                <Icon name="ph:check" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                        <Tooltip :text="$t('plansandgoals.forCompletion.extendDeadline')">
                                            <FormButton class="rounded-md" buttonSize="sm"
                                                @click="extendGoal(pendingPlanGoalSubgoal)">
                                                <Icon name="ph:arrows-out" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                    </div>
                                    <div class="flex items-center gap-2 flex-wrap md:flex-nowrap"
                                        v-if="pendingPlanGoalSubgoal?.type === 'Subgoal'">
                                        <Tooltip :text="$t('plansandgoals.forCompletion.extendDeadline')">
                                            <FormButton class="rounded-md" buttonSize="sm"
                                                @click="markSubgoalAsCompletedConfirmation(pendingPlanGoalSubgoal)">
                                                <Icon name="ph:check" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                        <Tooltip :text="$t('plansandgoals.forCompletion.extendDeadline')">
                                            <FormButton class="rounded-md" buttonSize="sm"
                                                @click="extendSubgoal(pendingPlanGoalSubgoal)">
                                                <Icon name="ph:arrows-out" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Pagination :data="state.pendingPlansGoalsSubgoals" @previous="previous" @next="next" />
                    </div>
                    <div v-else class="min-h-44 flex items-center">
                        <p class="text-center grow">
                            {{ $t('plansandgoals.forCompletion.noMorePendingPlansGoalsSubgoals') }}.
                        </p>
                    </div>
                </LoadingSpinner>
                <ModulesUserCitizenPlanModalExtendDeadline :isModalOpen="state.modal.isExtendPlanOpen"
                    :selectedPlan="state.selectedPlan" @close="state.modal.isExtendPlanOpen = false"
                    @refreshPlans="fetchPendingPlansGoalsSubgoals" />
                <ModulesUserCitizenPlanGoalModalExtendDeadline :isModalOpen="state.modal.isExtendGoalOpen"
                    :selectedGoal="state.selectedGoal" @close="state.modal.isExtendGoalOpen = false"
                    @refreshGoals="fetchPendingPlansGoalsSubgoals" />
                <ModulesUserCitizenPlanGoalSubgoalModalExtendDeadline :isModalOpen="state.modal.isExtendSubgoalOpen"
                    :selectedSubgoal="state.selectedSubgoal" @close="state.modal.isExtendSubgoalOpen = false"
                    @refreshGoals="fetchPendingPlansGoalsSubgoals" />

                <DialogConfirmation :isModalOpen="state.modal.isMarkPlanAsCompletedConfirmationOpen"
                    :message="$t('plansandgoals.forCompletion.confirmation.completionConfirmation') + '?'"
                    @close="state.modal.isMarkPlanAsCompletedConfirmationOpen = false" @confirm="markPlanAsCompleted" />
                <DialogConfirmation :isModalOpen="state.modal.isMarkGoalAsCompletedConfirmationOpen"
                    :message="$t('plansandgoals.forCompletion.confirmation.completionConfirmation') + '?'"
                    @close="state.modal.isMarkGoalAsCompletedConfirmationOpen = false" @confirm="markGoalAsCompleted" />
                <DialogConfirmation :isModalOpen="state.modal.isMarkSubgoalAsCompletedConfirmationOpen"
                    :message="$t('plansandgoals.forCompletion.confirmation.completionConfirmation') + '?'"
                    @close="state.modal.isMarkSubgoalAsCompletedConfirmationOpen = false"
                    @confirm="markSubgoalAsCompleted" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { planGoalSubgoalService } from '@/components/api/user/PlanGoalSubgoalService'
import { planService } from '@/components/api/user/PlanService'
import { goalService } from '@/components/api/user/GoalService'
import { subgoalService } from '@/components/api/user/SubgoalService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const { t } = useI18n()
const { successAlert } = useAlert()
const breadcrumbLinks = [
    {
        name: 'plansandgoals.forCompletion.managePendingPlansGoalsandSubgoals',
        translate: true,
        href: '/plans-goals-subgoals-completions',
    },
]
let currentTablePage = 1

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isExtendPlanOpen: false,
        isExtendGoalOpen: false,
        isExtendSubgoalOpen: false,
        isMarkPlanAsCompletedConfirmationOpen: false,
        isMarkGoalAsCompletedConfirmationOpen: false,
        isMarkSubgoalAsCompletedConfirmationOpen: false,
    },
    pendingPlansGoalsSubgoals: [] as any,
    selectedGoal: {} as any,
    selectedPlan: {} as any,
    selectedSubgoal: {} as any,
    sortData: {
        sortField: 'completion_date',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchPendingPlansGoalsSubgoals()
})

async function fetchPendingPlansGoalsSubgoals() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            page: currentTablePage,
        }
        const response = await planGoalSubgoalService.getPendingPlansGoalsSubgoals(params)
        if (response) {
            state.pendingPlansGoalsSubgoals = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function previous() {
    currentTablePage--
    fetchPendingPlansGoalsSubgoals()
}

function next() {
    currentTablePage++
    fetchPendingPlansGoalsSubgoals()
}

function extendPlan(pendingPlanGoalSubgoal: any) {
    state.selectedPlan = pendingPlanGoalSubgoal
    state.modal.isExtendPlanOpen = true
}

function extendGoal(pendingPlanGoalSubgoal: any) {
    state.selectedGoal = pendingPlanGoalSubgoal
    state.modal.isExtendGoalOpen = true
}

function extendSubgoal(pendingPlanGoalSubgoal: any) {
    state.selectedSubgoal = pendingPlanGoalSubgoal
    state.modal.isExtendSubgoalOpen = true
}

function markPlanAsCompletedConfirmation(plan: any) {
    state.selectedPlan = plan
    state.modal.isMarkPlanAsCompletedConfirmationOpen = true
}

async function markPlanAsCompleted() {
    state.error = {}
    state.isPageLoading = true
    try {
        const planUuid = state.selectedPlan?.uuid
        const response = await planService.togglePlanCompletionDate(planUuid)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.forCompletion.alert.planSuccessfullyMarkedAsCompleted')}.`)
            fetchPendingPlansGoalsSubgoals()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function markGoalAsCompletedConfirmation(goal: any) {
    state.selectedGoal = goal
    state.modal.isMarkGoalAsCompletedConfirmationOpen = true
}

async function markGoalAsCompleted() {
    state.error = {}
    state.isPageLoading = true
    try {
        const goalUuid = state.selectedGoal?.uuid
        const response = await goalService.toggleGoalCompletionDate(goalUuid)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.forCompletion.alert.goalSuccessfullyMarkedAsCompleted')}.`)
            fetchPendingPlansGoalsSubgoals()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function markSubgoalAsCompletedConfirmation(subgoal: any) {
    state.selectedSubgoal = subgoal
    state.modal.isMarkSubgoalAsCompletedConfirmationOpen = true
}

async function markSubgoalAsCompleted() {
    state.error = {}
    state.isPageLoading = true
    try {
        const subgoalUuid = state.selectedSubgoal?.uuid
        const response = await subgoalService.toggleSubgoalCompletionDate(subgoalUuid)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.forCompletion.alert.subgoalSuccessfullyMarkedAsCompleted')}.`)
            fetchPendingPlansGoalsSubgoals()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>