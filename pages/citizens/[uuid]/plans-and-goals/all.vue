<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.plansAndGoals') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.tabs.plansAndGoals') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="mt-8 space-y-3">
                        <div class="flex justify-between flex-col md:flex-row gap-3">
                            <div class="flex gap-2">
                                <FormButton buttonStyle="primary" class="w-28"
                                    @click="navigateTo(`/citizens/${citizenUuid}/plans-and-goals/all`)">
                                    {{ $t('plansandgoals.viewType.all') }}
                                </FormButton>
                                <FormButton class="w-28"
                                    @click="navigateTo(`/citizens/${citizenUuid}/plans-and-goals/active`)">
                                    {{ $t('plansandgoals.viewType.active') }}
                                </FormButton>
                                <FormButton class="w-28"
                                    @click="navigateTo(`/citizens/${citizenUuid}/plans-and-goals/archived`)">
                                    {{ $t('plansandgoals.viewType.archived') }}
                                </FormButton>
                            </div>
                            <div class="flex flex-col md:flex-row justify-end md:items-center gap-2">
                                <Menu as="div" class="w-full md:w-fit relative inline-block text-left z-20"
                                    v-if="hasCreatePlanAccess()">
                                    <div>
                                        <MenuButton class="w-full md:w-fit">
                                            <FormButton buttonStyle="action" class="w-full md:w-fit">
                                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                                {{ $t('plansandgoals.newPlanOrGoal') }}
                                            </FormButton>
                                        </MenuButton>
                                    </div>

                                    <transition enter-active-class="transition duration-100 ease-out"
                                        enter-from-class="transform scale-95 opacity-0"
                                        enter-to-class="transform scale-100 opacity-100"
                                        leave-active-class="transition duration-75 ease-in"
                                        leave-from-class="transform scale-100 opacity-100"
                                        leave-to-class="transform scale-95 opacity-0">
                                        <MenuItems
                                            class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                                            <div class="px-1 py-1">
                                                <MenuItem v-slot="{ active }" @click="state.modal.isAddPlanOpen = true">
                                                <button :class="[
                                                    active && 'bg-gray-100',
                                                    'group flex w-full items-center rounded-md px-2 py-2.5 text-sm',
                                                ]">
                                                    <Icon name="ph:plus" class="mr-2 h-4 w-4" aria-hidden="true" />
                                                    {{ $t('plansandgoals.newPlan') }}
                                                </button>
                                                </MenuItem>
                                                <MenuItem v-slot="{ active }"
                                                    @click="state.modal.isAddSingleGoalOpen = true">
                                                <button :class="[
                                                    active && 'bg-gray-100',
                                                    'group flex w-full items-center rounded-md px-2 py-2.5 text-sm',
                                                ]">
                                                    <Icon name="ph:plus" class="mr-2 h-4 w-4" aria-hidden="true" />
                                                    {{ $t('plansandgoals.newSingleGoal') }}
                                                </button>
                                                </MenuItem>
                                            </div>
                                        </MenuItems>
                                    </transition>
                                </Menu>
                                <FormButton buttonStyle="action" @click="state.modal.isCreateStatusTemplateOpen = true">
                                    <Icon name="ph:file" class="h-4 w-4" aria-hidden="true" />
                                    {{ $t('plansandgoals.createStatusTemplate.createReport') }}
                                </FormButton>
                                <FormButton buttonStyle="action" @click="downloadPlansAndGoals">
                                    <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                                    {{ $t('plansandgoals.download') }}
                                </FormButton>
                                <FormButton buttonStyle="action" @click="navigateTo('/vum-templates')">
                                    <Icon name="ph:files" class="h-4 w-4" aria-hidden="true" />
                                    {{ $t('plansandgoals.VUMTemplates.templates') }}
                                </FormButton>
                            </div>
                        </div>

                        <div>
                            <button class="flex items-center gap-x-1 text-sm text-primary group"
                                @click="state.modal.isFilterPlansAndGoalsOpen = true">
                                <Icon name="ic:outline-filter-list"
                                    class="text-primary w-6 h-6 group-hover:text-primary-700" />
                                <span class="group-hover:text-primary-700">
                                    {{ $t('filter') }}
                                </span>
                            </button>
                        </div>

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
                                            <Tooltip :text="$t('plansandgoals.table.actions.seeSubgoals')"
                                                v-if="plan?.is_single_goal">
                                                <FormButton buttonSize="sm" buttonStyle="primary"
                                                    @click="viewSubgoals(plan)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('plansandgoals.table.actions.seeGoals')" v-else>
                                                <FormButton buttonSize="sm" buttonStyle="primary"
                                                    @click="viewPlan(plan)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('plansandgoals.table.actions.edit')"
                                                v-if="plan?.is_editable && plan?.is_single_goal">
                                                <FormButton buttonSize="sm" buttonStyle="primary"
                                                    @click="editGoal(plan)">
                                                    <Icon name="ph:pencil-duotone" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('plansandgoals.table.actions.edit')"
                                                v-if="plan?.is_editable && !plan?.is_single_goal">
                                                <FormButton buttonSize="sm" buttonStyle="primary"
                                                    @click="editPlan(plan)">
                                                    <Icon name="ph:pencil-duotone" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('plansandgoals.table.actions.archive')"
                                                v-if="plan?.is_single_goal">
                                                <FormButton buttonSize="sm" buttonStyle="primary"
                                                    @click="confirmGoalArchive(plan)">
                                                    <Icon name="ph:archive" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('plansandgoals.table.actions.archive')"
                                                v-if="!plan?.is_single_goal">
                                                <FormButton buttonSize="sm" buttonStyle="primary"
                                                    @click="confirmPlanArchive(plan)">
                                                    <Icon name="ph:archive" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('plansandgoals.table.actions.graph')">
                                                <FormButton buttonSize="sm" buttonStyle="primary"
                                                    @click="openChart(plan)">
                                                    <Icon name="ph:chart-line" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('plansandgoals.table.actions.notes')">
                                                <FormButton buttonSize="sm" buttonStyle="primary"
                                                    @click="viewNotes(plan)">
                                                    <Icon name="ph:check-square-offset" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('plansandgoals.table.actions.reports')">
                                                <FormButton buttonSize="sm" buttonStyle="primary"
                                                    @click="viewStatuses(plan)">
                                                    <Icon name="ph:file" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('plansandgoals.table.actions.notifications')">
                                                <FormButton buttonSize="sm" buttonStyle="primary"
                                                    @click="viewNotifications(plan)">
                                                    <Icon name="ph:bell" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('plansandgoals.table.actions.delete')"
                                                v-if="plan?.is_deletable && !plan?.is_single_goal">
                                                <FormButton buttonStyle="danger" buttonSize="sm"
                                                    @click="confirmPlanDeletion(plan)">
                                                    <Icon name="heroicons:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('plansandgoals.table.actions.delete')"
                                                v-if="plan?.is_deletable && plan?.is_single_goal">
                                                <FormButton buttonStyle="danger" buttonSize="sm"
                                                    @click="confirmGoalDeletion(plan)">
                                                    <Icon name="heroicons:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
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
                    </div>
                </LoadingSpinner>
            </div>
            <ModulesUserCitizenPlanModalFilter :isModalOpen="state.modal.isFilterPlansAndGoalsOpen"
                @close="state.modal.isFilterPlansAndGoalsOpen = false" @setFilterView="setFilterView" />
            <ModulesUserCitizenPlanStatusTemplateModalNew :isModalOpen="state.modal.isCreateStatusTemplateOpen"
                @close="state.modal.isCreateStatusTemplateOpen = false" />
            <ModulesUserCitizenPlanModalNewPlan :isModalOpen="state.modal.isAddPlanOpen"
                @close="state.modal.isAddPlanOpen = false" @refreshPlans="fetchPlans" />
            <ModulesUserCitizenPlanModalEdit :isModalOpen="state.modal.isEditPlanOpen"
                :selectedPlan="state.selectedPlan" @close="closeEditPlanModal" @refreshPlans="fetchPlans" />
            <ModulesUserCitizenPlanSingleGoalModalNew :isModalOpen="state.modal.isAddSingleGoalOpen"
                @close="state.modal.isAddSingleGoalOpen = false" @refreshPlans="fetchPlans" />
            <ModulesUserCitizenPlanSingleGoalModalEdit :isModalOpen="state.modal.isEditSingleGoalOpen"
                :selectedGoal="state.selectedGoal" @close="state.modal.isEditSingleGoalOpen = false"
                @refreshPlans="fetchPlans" />
            <ModulesUserCitizenPlanChartModalChart :isModalOpen="state.modal.isChartOpen"
                :selectedData="state.selectedPlan" @close="state.modal.isChartOpen = false" />
            <ModulesUserCitizenPlanNotesModalNotes :isModalOpen="state.modal.isNotesOpen"
                :selectedData="state.selectedPlan" @close="closeNotesModal" @refreshData="fetchPlans" />
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
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
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
const breadcrumbLinks = [
    {
        name: 'citizens.tabs.plansAndGoals',
        translate: true,
        href: `/citizens/${citizenUuid}/plans-and-goals`,
    },
]

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

watch(() => (state.slideOver.isGoalOpen), (isGoalOpen: boolean) => {
    if (!isGoalOpen) {
        fetchPlans()
    }
})

onMounted(() => {
    fetchPlans()
})

function hasCreatePlanAccess() {
    const user = userStore.getUser
    const hasAdminAccess = isAdmin(user?.roles)
    const employeeCanCreatePlan = user?.company?.employee_create_plans_enabled
    if (hasAdminAccess) {
        return true
    } else if (employeeCanCreatePlan) {
        return true
    }
    return false
}

function isAdmin(roles: any) {
    return roles && roles.some((role: any) => role.name === 'Admin')
}

function setFilterView(formFilter: any) {
    citizenPlansAndGoalsStore.setFilterIsCompleted(formFilter?.is_completed)
    citizenPlansAndGoalsStore.setFilterView(formFilter?.selectedViewFilter?.title)
    fetchPlans()
}

async function fetchPlans() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            type: 'all',
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            is_completed: citizenPlansAndGoalsStore.getFilterIsCompleted,
            view_filter: citizenPlansAndGoalsStore.getFilterView,
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
    state.sortData = {
        sortField: 'completion_date',
        sortOrder: 'descend',
    }
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

async function downloadPlansAndGoals() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid
        }
        const response = await planService.downloadPlansAndGoals(params)
        if (response) {
            if (response) {
                saveAs(response, 'Plans-and-goals' + '-' + citizenUuid)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>