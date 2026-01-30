<template>
    <h3 class="text-primary text-base font-medium py-2">
        {{ $t('overview.plansGoalsAndSubgoals.plansAndGoals') }}
    </h3>
    <div
        class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 pr-5 pt-6 pb-7 pl-6 mr-1">
        <div class="space-y-5">
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
                        <div class="flex items-center gap-x-2">
                            <div>
                                <Badge :type="plan?.is_completed ? 'active' : 'primary'">
                                    <p class="text-xxs truncate">
                                        {{ plan?.is_completed ? $t('plansandgoals.completed') :
                                            $t('plansandgoals.inProgress') }}
                                    </p>
                                </Badge>
                            </div>
                            <h3 class="text-lg font-semibold">
                                {{ plan?.name }}
                            </h3>
                        </div>
                        <div class="text-sm">
                            <div v-html="plan?.description" class="content" />
                        </div>
                        <div class="mt-1">
                            <Badge type="primary" class="w-fit" v-if="plan.score">
                                <p class="text-xxs" v-if="plan.score == 1">
                                    {{
                                        $t('plansandgoals.table.expectedLevels.minorChallenges')
                                    }}
                                </p>
                                <p class="text-xxs" v-if="plan.score == 2">
                                    {{
                                        $t('plansandgoals.table.expectedLevels.moderateChallenges')
                                    }}
                                </p>
                                <p class="text-xxs" v-if="plan.score == 3">
                                    {{
                                        $t('plansandgoals.table.expectedLevels.significantChallenges')
                                    }}
                                </p>
                                <p class="text-xxs" v-if="plan.score == 4">
                                    {{
                                        $t('plansandgoals.table.expectedLevels.severeChallenges')
                                    }}
                                </p>
                                <p class="text-xxs" v-if="plan.score == 5">
                                    {{
                                        $t('plansandgoals.table.expectedLevels.verySubstantialChallenges')
                                    }}
                                </p>
                            </Badge>
                        </div>
                        <p class="text-sm">
                            {{ $t('plansandgoals.dateCreated') }}: {{
                                formatDateToReadable(plan?.created_at) }}
                        </p>
                        <p class="text-sm">
                            <span v-if="plan?.is_completed && plan?.date_completed">
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
                            <Tooltip :text="$t('plansandgoals.table.actions.seeSubgoals')" v-if="plan?.is_single_goal">
                                <FormButton class="rounded-md" buttonSize="sm" buttonStyle="primary"
                                    @click="viewSubgoals(plan)">
                                    <Icon name="ph:eye" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('plansandgoals.table.actions.seeGoals')" v-else>
                                <FormButton class="rounded-md" buttonSize="sm" buttonStyle="primary"
                                    @click="viewPlan(plan)">
                                    <Icon name="ph:eye" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('plansandgoals.table.actions.edit')"
                                v-if="plan?.is_editable && plan?.is_single_goal">
                                <FormButton class="rounded-md" buttonSize="sm" buttonStyle="primary"
                                    @click="editGoal(plan)">
                                    <Icon name="ph:pencil-duotone" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('plansandgoals.table.actions.edit')"
                                v-if="plan?.is_editable && !plan?.is_single_goal">
                                <FormButton class="rounded-md" buttonSize="sm" buttonStyle="primary"
                                    @click="editPlan(plan)">
                                    <Icon name="ph:pencil-duotone" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('plansandgoals.table.actions.archive')" v-if="plan?.is_single_goal">
                                <FormButton class="rounded-md" buttonSize="sm" buttonStyle="primary"
                                    @click="confirmGoalArchive(plan)">
                                    <Icon name="ph:archive" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('plansandgoals.table.actions.archive')" v-if="!plan?.is_single_goal">
                                <FormButton class="rounded-md" buttonSize="sm" buttonStyle="primary"
                                    @click="confirmPlanArchive(plan)">
                                    <Icon name="ph:archive" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('plansandgoals.table.actions.graph')">
                                <FormButton class="rounded-md" buttonSize="sm" buttonStyle="primary"
                                    @click="openChart(plan)">
                                    <Icon name="ph:chart-line" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('plansandgoals.table.actions.notes')">
                                <FormButton class="rounded-md" buttonSize="sm" buttonStyle="primary"
                                    @click="viewNotes(plan)">
                                    <Icon name="ph:check-square-offset" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('plansandgoals.table.actions.reports')">
                                <FormButton class="rounded-md" buttonSize="sm" buttonStyle="primary"
                                    @click="viewStatuses(plan)">
                                    <Icon name="ph:file" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('plansandgoals.table.actions.notifications')">
                                <FormButton class="rounded-md" buttonSize="sm" buttonStyle="primary"
                                    @click="viewNotifications(plan)">
                                    <Icon name="ph:bell" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('plansandgoals.table.actions.delete')"
                                v-if="plan?.is_deletable && !plan?.is_single_goal">
                                <FormButton class="rounded-md" buttonStyle="danger" buttonSize="sm"
                                    @click="confirmPlanDeletion(plan)">
                                    <Icon name="heroicons:trash" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('plansandgoals.table.actions.delete')"
                                v-if="plan?.is_deletable && plan?.is_single_goal">
                                <FormButton class="rounded-md" buttonStyle="danger" buttonSize="sm"
                                    @click="confirmGoalDeletion(plan)">
                                    <Icon name="heroicons:trash" class="size-4" />
                                </FormButton>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="state.plans?.data?.length === 0">
                <p class="mt-10 text-center">
                    {{ $t('theresNoDataAvailableToDisplay') }}.
                </p>
            </div>
            <Pagination :data="state.plans" @previous="previous" @next="next" />
        </div>
        <ModulesUserCitizenPlanModalEdit :isModalOpen="state.modal.isEditPlanOpen" :selectedPlan="state.selectedPlan"
            @close="closeEditPlanModal" @refreshPlans="fetchPlans" />
        <ModulesUserCitizenPlanNotesModalNotes :isModalOpen="state.modal.isNotesOpen" :selectedData="state.selectedPlan"
            @close="closeNotesModal" @refreshData="fetchPlans" />
        <ModulesUserCitizenPlanStatusTemplateModalStatuses :isModalOpen="state.modal.isViewStatuses"
            :selectedData="state.selectedPlan" @close="closeStatusesModal" />
        <ModulesUserCitizenPlanNotificationModalNotifications :isModalOpen="state.modal.isNotificationsOpen"
            :selectedData="state.selectedPlan" @close="state.modal.isNotificationsOpen = false" />
        <DialogConfirmation :isModalOpen="state.modal.isArchiveGoalOpen"
            :message="`${$t('plansandgoals.confirmation.archiveGoalConfirmation')}?`"
            @close="state.modal.isArchiveGoalOpen = false" @confirm="archiveGoal" />
        <DialogConfirmation :isModalOpen="state.modal.isArchivePlanOpen"
            :message="`${$t('plansandgoals.confirmation.archivePlanConfirmation')}?`"
            @close="state.modal.isArchivePlanOpen = false" @confirm="archivePlan" />
        <DialogConfirmation :isModalOpen="state.modal.isDeletePlanOpen"
            :message="`${$t('plansandgoals.confirmation.deletePlanConfirmation')}?`"
            @close="state.modal.isDeletePlanOpen = false" @confirm="deletePlan" />
        <DialogConfirmation :isModalOpen="state.modal.isDeleteSingleGoalOpen"
            :message="`${$t('plansandgoals.confirmation.deleteGoalConfirmation')}?`"
            @close="state.modal.isDeleteSingleGoalOpen = false" @confirm="deleteGoal" />
        <ModulesUserCitizenPlanGoalSlideOver :isOpen="state.slideOver.isGoalOpen" :selectedPlan="state.selectedPlan"
            @close="state.slideOver.isGoalOpen = false" />
        <ModulesUserCitizenPlanSingleGoalSlideOver :isOpen="state.slideOver.isSubgoalOpen"
            :selectedGoal="state.selectedGoal" @close="state.slideOver.isSubgoalOpen = false" />
    </div>
</template>

<script setup lang="ts">
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { planService } from '@/components/api/user/PlanService'
import { goalService } from '@/components/api/user/GoalService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useCitizenPlansAndGoalsStore } from '@/store/citizen-plans-and-goals'
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'

const props = defineProps({
    dateRange: {
        type: Object,
        required: false,
    } as any,
})

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const citizenPlansAndGoalsStore = useCitizenPlansAndGoalsStore()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1

const state = reactive({
    dataFilter: [],
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isAddPlanOpen: false,
        isAddSingleGoalOpen: false,
        isArchiveGoalOpen: false,
        isArchivePlanOpen: false,
        isChartOpen: false,
        isCreateStatusTemplateOpen: false,
        isDeletePlanOpen: false,
        isDeleteSingleGoalOpen: false,
        isEditPlanOpen: false,
        isEditSingleGoalOpen: false,
        isFilterPlansAndGoalsOpen: false,
        isNotesOpen: false,
        isNotificationsOpen: false,
        isViewStatuses: false,
    },
    plans: [] as any,
    selectedGoal: {} as any,
    selectedPlan: {} as any,
    slideOver: {
        isGoalOpen: false,
        isSubgoalOpen: false,
    },
    sortData: {
        sortField: 'completion_date',
        sortOrder: 'descend',
    },
})

watch(() => props.dateRange, () => {
    fetchPlans()
}, { deep: true })


watch(() => (state.slideOver.isGoalOpen), (isGoalOpen: boolean) => {
    if (!isGoalOpen) {
        fetchPlans()
    }
})

onMounted(() => {
    fetchPlans()
})

async function fetchPlans() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            type: 'all',
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            start_date: props.dateRange.start_date,
            end_date: props.dateRange.end_date,
            ...state.dataFilter
        }
        const response = await planService.getPlans(params)
        if (response) {
            state.plans = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function resetFilter() {
    currentTablePage = 1
    state.dataFilter = []
    fetchPlans()
}


function previous() {
    currentTablePage--
    fetchPlans()
}

function next() {
    currentTablePage++
    fetchPlans()
}

function editGoal(goal: any) {
    state.selectedGoal = goal
    state.modal.isEditSingleGoalOpen = true
}

function editPlan(plan: any) {
    state.selectedPlan = plan
    state.modal.isEditPlanOpen = true
}

function confirmGoalArchive(plan: any) {
    state.selectedGoal = plan
    state.modal.isArchiveGoalOpen = true
}

async function archiveGoal() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await goalService.archiveUnarchiveGoal(state.selectedGoal.uuid)
        if (response?.data) {
            if (state.plans?.data?.length === 1) {
                resetFilter()
            } else {
                fetchPlans()
            }
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.goalSuccessfullyArchived')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function confirmPlanArchive(plan: any) {
    state.selectedPlan = plan
    state.modal.isArchivePlanOpen = true
}

async function archivePlan() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await planService.archiveUnarchivePlan(state.selectedPlan.uuid)
        if (response?.data) {
            if (state.plans?.data?.length === 1) {
                resetFilter()
            } else {
                fetchPlans()
            }
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.planSuccessfullyArchived')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function openChart(plan: any) {
    state.selectedPlan = plan
    state.modal.isChartOpen = true
}

function viewNotes(plan: any) {
    state.selectedPlan = plan
    state.modal.isNotesOpen = true
}

function closeNotesModal() {
    state.modal.isNotesOpen = false
    state.selectedPlan = {}
}


function viewStatuses(plan: any) {
    state.selectedPlan = plan
    state.modal.isViewStatuses = true
}

function closeStatusesModal() {
    state.modal.isViewStatuses = false
    state.selectedPlan = {}
}

function viewNotifications(plan: any) {
    state.selectedPlan = plan
    state.modal.isNotificationsOpen = true
}

function viewSubgoals(goal: any) {
    state.selectedGoal = goal
    state.slideOver.isSubgoalOpen = true
}

function viewPlan(plan: any) {
    state.selectedPlan = plan
    state.slideOver.isGoalOpen = true
}

function closeEditPlanModal() {
    state.modal.isEditPlanOpen = false
    state.selectedPlan = {}
}

function confirmPlanDeletion(plan: any) {
    state.selectedPlan = plan
    state.modal.isDeletePlanOpen = true
}

async function deletePlan() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await planService.deletePlan(state.selectedPlan.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            if (state.plans?.data?.length === 1) {
                resetFilter()
            } else {
                fetchPlans()
            }
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.planSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function confirmGoalDeletion(goal: any) {
    state.selectedGoal = goal
    state.modal.isDeleteSingleGoalOpen = true
}

async function deleteGoal() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await goalService.deleteGoal(state.selectedGoal.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            if (state.plans?.data?.length === 1) {
                resetFilter()
            } else {
                fetchPlans()
            }
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.goalSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>