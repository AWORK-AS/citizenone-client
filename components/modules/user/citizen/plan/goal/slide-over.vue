<template>
    <TransitionRoot as="template" :show="props.isOpen">
        <Dialog class="relative z-50" @close="closeSlide">
            <div class="fixed inset-0" />

            <div class="fixed inset-0 overflow-hidden">
                <div class="absolute inset-0 overflow-hidden">
                    <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <TransitionChild as="template"
                            enter="transform transition ease-in-out duration-500 sm:duration-600"
                            enter-from="translate-x-full" enter-to="translate-x-0"
                            leave="transform transition ease-in-out duration-500 sm:duration-300"
                            leave-from="translate-x-0" leave-to="translate-x-full">
                            <DialogPanel class="pointer-events-auto w-screen max-w-4xl">
                                <div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                    <div class="bg-tertiary px-4 py-6 sm:px-6">
                                        <div class="flex items-center justify-between">
                                            <DialogTitle>
                                                <div class="flex items-center gap-x-2">
                                                    <h3 class="text-base font-semibold leading-6 text-white">
                                                        {{ props.selectedPlan?.name }}
                                                    </h3>
                                                    <Badge
                                                        :type="props.selectedPlan?.is_completed ? 'active' : 'primary'">
                                                        <p class="text-xxs">
                                                            <span v-if="props.selectedPlan?.is_completed">
                                                                {{ $t('plansandgoals.completed') }}
                                                            </span>
                                                            <span v-else>
                                                                {{ $t('plansandgoals.inProgress') }}
                                                            </span>
                                                        </p>
                                                    </Badge>
                                                </div>
                                            </DialogTitle>
                                            <div class="ml-3 flex h-7 items-center">
                                                <button type="button" class="relative rounded-md text-white"
                                                    @click="closeSlide">
                                                    <span class="absolute -inset-2.5" />
                                                    <span class="sr-only">Close panel</span>
                                                    <Icon name="heroicons:x-mark" class="h-6 w-6" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                        <div class="mt-1">
                                            <p class="text-sm text-white">
                                                {{ $t('plansandgoals.dateCreated') }}: {{
                                                    formatDateToReadable(props.selectedPlan?.created_at) }}
                                            </p>
                                            <p class="text-sm text-white">
                                                {{ $t('plansandgoals.completionDate') }}:
                                                {{ formatDateToReadable(props.selectedPlan?.completion_date) }}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="relative flex-1 px-4 py-6 sm:px-6 space-y-3">
                                        <div class="flex justify-end items-center">
                                            <FormButton buttonStyle="action" class="rounded-md"
                                                @click="state.modal.isAddGoalOpen = true" v-if="hasCreateGoalsAccess()">
                                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                                {{ $t('plansandgoals.newGoal') }}
                                            </FormButton>
                                        </div>
                                        <LoadingSpinner :isActive="state.isPageLoading">
                                            <dl class="space-y-5">
                                                <Disclosure as="div" v-slot="{ open }"
                                                    v-for="(goal, index) in state.goals?.data" :index="index"
                                                    class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary">
                                                    <div>
                                                        <div class="flex justify-between items-center">
                                                            <div>
                                                                <div class="flex items-center gap-x-2">
                                                                    <h3 class="text-lg font-semibold">
                                                                        {{ goal?.name }}
                                                                    </h3>
                                                                    <div>
                                                                        <Badge
                                                                            :type="goal?.date_completed ? 'active' : 'primary'">
                                                                            <p class="text-xxs truncate">
                                                                                <span v-if="goal?.date_completed">
                                                                                    {{ $t('plansandgoals.completed') }}
                                                                                </span>
                                                                                <span v-else>
                                                                                    {{ $t('plansandgoals.inProgress') }}
                                                                                </span>
                                                                            </p>
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="flex gap-x-2">
                                                                <Tooltip :text="$t('plansandgoals.newSubgoal')"
                                                                    v-if="hasCreateSubgoalsAccess()">
                                                                    <FormButton class="rounded-md" buttonSize="sm"
                                                                        @click="addSubgoal(goal)">
                                                                        <Icon name="ph:plus" class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip :text="$t('plansandgoals.table.actions.edit')"
                                                                    v-if="goal?.is_editable">
                                                                    <FormButton class="rounded-md" buttonSize="sm"
                                                                        @click="editGoal(goal)">
                                                                        <Icon name="ph:pencil-duotone" class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip
                                                                    :text="$t('plansandgoals.table.actions.archive')">
                                                                    <FormButton class="rounded-md" buttonSize="sm"
                                                                        @click="confirmGoalArchive(goal)">
                                                                        <Icon name="ph:archive" class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip
                                                                    :text="$t('plansandgoals.table.actions.graph')">
                                                                    <FormButton class="rounded-md" buttonSize="sm"
                                                                        @click="openGoalChart(goal)">
                                                                        <Icon name="ph:chart-line" class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip
                                                                    :text="$t('plansandgoals.table.actions.notes')">
                                                                    <FormButton class="rounded-md" buttonSize="sm"
                                                                        @click="viewGoalStatuses(goal)">
                                                                        <Icon name="ph:check-square-offset"
                                                                            class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip
                                                                    :text="$t('plansandgoals.table.actions.notifications')">
                                                                    <FormButton class="rounded-md" buttonSize="sm"
                                                                        @click="viewGoalNotifications(goal)">
                                                                        <Icon name="ph:bell" class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip
                                                                    :text="$t('plansandgoals.table.actions.delete')"
                                                                    v-if="goal?.is_deletable">
                                                                    <FormButton class="rounded-md" buttonSize="sm"
                                                                        @click="confirmGoalDeletion(goal)">
                                                                        <Icon name="ph:trash" class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <DisclosureButton>
                                                                    <FormButton class="rounded-md" buttonSize="sm">
                                                                        <Icon name="ic:round-keyboard-arrow-down"
                                                                            class="size-4" v-if="!open" />
                                                                        <Icon name="ic:round-keyboard-arrow-up"
                                                                            class="size-4" v-else />
                                                                    </FormButton>
                                                                </DisclosureButton>
                                                            </div>
                                                        </div>
                                                        <div class="mt-1">
                                                            <Badge type="primary" class="w-fit" v-if="goal.score">
                                                                <p class="text-xxs" v-if="goal.score == 1">
                                                                    {{
                                                                        $t('plansandgoals.table.expectedLevels.minorChallenges')
                                                                    }}
                                                                </p>
                                                                <p class="text-xxs" v-if="goal.score == 2">
                                                                    {{
                                                                        $t('plansandgoals.table.expectedLevels.moderateChallenges')
                                                                    }}
                                                                </p>
                                                                <p class="text-xxs" v-if="goal.score == 3">
                                                                    {{
                                                                        $t('plansandgoals.table.expectedLevels.significantChallenges')
                                                                    }}
                                                                </p>
                                                                <p class="text-xxs" v-if="goal.score == 4">
                                                                    {{
                                                                        $t('plansandgoals.table.expectedLevels.severeChallenges')
                                                                    }}
                                                                </p>
                                                                <p class="text-xxs" v-if="goal.score == 5">
                                                                    {{
                                                                        $t('plansandgoals.table.expectedLevels.verySubstantialChallenges')
                                                                    }}
                                                                </p>
                                                            </Badge>
                                                        </div>
                                                        <p class="text-sm">
                                                            {{ $t('plansandgoals.dateCreated') }}: {{
                                                                formatDateToReadable(goal?.created_at) }}
                                                        </p>
                                                        <p class="text-sm">
                                                            {{ $t('plansandgoals.completionDate') }}:
                                                            {{ formatDateToReadable(goal?.completion_date) }}
                                                        </p>
                                                        <div v-html="goal?.description" class="content text-sm" />
                                                    </div>
                                                    <DisclosurePanel as="dd" class="mt-5 mx-5 my-0">
                                                        <div class="mb-6">
                                                            <p class="font-semibold text-sm py-1"
                                                                v-if="goal?.citizen_subgoals?.length > 0">
                                                                {{ $t('plansandgoals.subgoals') }}
                                                            </p>
                                                            <p class="text-sm bg-tertiary-25 px-4 py-6 text-center rounded-md"
                                                                v-else>
                                                                {{ $t('plansandgoals.noAvailableSubgoals') }}.
                                                            </p>
                                                            <dl class="mt-2 space-y-3">
                                                                <div v-for="(subgoal, index) in goal?.citizen_subgoals"
                                                                    :key="index" class="bg-tertiary-25 p-4 rounded-md">
                                                                    <div class="py-4">
                                                                        <div class="flex justify-between items-center">
                                                                            <div>
                                                                                <div class="flex items-center gap-x-2">
                                                                                    <h3 class="text-lg font-semibold">
                                                                                        {{ subgoal?.name }}
                                                                                    </h3>
                                                                                    <div>
                                                                                        <Badge
                                                                                            :type="subgoal?.date_completed ? 'active' : 'primary'">
                                                                                            <p class="text-xxs">
                                                                                                {{
                                                                                                    subgoal?.date_completed
                                                                                                        ?
                                                                                                        $t('plansandgoals.completed')
                                                                                                        :
                                                                                                        $t('plansandgoals.inProgress')
                                                                                                }}
                                                                                            </p>
                                                                                        </Badge>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="mt-1">
                                                                                    <Badge type="primary" class="w-fit"
                                                                                        v-if="subgoal.score">
                                                                                        <p class="text-xxs"
                                                                                            v-if="subgoal.score == 1">
                                                                                            {{
                                                                                                $t('plansandgoals.table.expectedLevels.minorChallenges')
                                                                                            }}
                                                                                        </p>
                                                                                        <p class="text-xxs"
                                                                                            v-if="subgoal.score == 2">
                                                                                            {{
                                                                                                $t('plansandgoals.table.expectedLevels.moderateChallenges')
                                                                                            }}
                                                                                        </p>
                                                                                        <p class="text-xxs"
                                                                                            v-if="subgoal.score == 3">
                                                                                            {{
                                                                                                $t('plansandgoals.table.expectedLevels.significantChallenges')
                                                                                            }}
                                                                                        </p>
                                                                                        <p class="text-xxs"
                                                                                            v-if="subgoal.score == 4">
                                                                                            {{
                                                                                                $t('plansandgoals.table.expectedLevels.severeChallenges')
                                                                                            }}
                                                                                        </p>
                                                                                        <p class="text-xxs"
                                                                                            v-if="subgoal.score == 5">
                                                                                            {{
                                                                                                $t('plansandgoals.table.expectedLevels.verySubstantialChallenges')
                                                                                            }}
                                                                                        </p>
                                                                                    </Badge>
                                                                                </div>
                                                                                <p class="text-sm">
                                                                                    {{ $t('plansandgoals.dateCreated')
                                                                                    }}: {{
                                                                                        formatDateToReadable(subgoal?.created_at)
                                                                                    }}
                                                                                </p>
                                                                                <p class="text-sm">
                                                                                    <span
                                                                                        v-if="subgoal?.date_completed">
                                                                                        {{
                                                                                            $t('plansandgoals.dateCompleted')
                                                                                        }}:
                                                                                        {{
                                                                                            formatDateToReadable(subgoal?.date_completed)
                                                                                        }}
                                                                                    </span>
                                                                                    <span v-else>
                                                                                        {{
                                                                                            $t('plansandgoals.completionDate')
                                                                                        }}: {{
                                                                                            formatDateToReadable(subgoal?.completion_date)
                                                                                        }}
                                                                                    </span>
                                                                                </p>
                                                                            </div>
                                                                            <div class="flex gap-x-1">
                                                                                <Tooltip
                                                                                    :text="$t('plansandgoals.table.actions.edit')"
                                                                                    v-if="subgoal?.is_editable">
                                                                                    <FormButton class="rounded-md"
                                                                                        buttonSize="sm"
                                                                                        @click="editSubGoal(subgoal)">
                                                                                        <Icon name="ph:pencil-duotone"
                                                                                            class="size-4" />
                                                                                    </FormButton>
                                                                                </Tooltip>
                                                                                <Tooltip
                                                                                    :text="$t('plansandgoals.table.actions.archive')">
                                                                                    <FormButton class="rounded-md"
                                                                                        buttonSize="sm"
                                                                                        @click="confirmSubgoalArchive(subgoal)">
                                                                                        <Icon name="ph:archive"
                                                                                            class="size-4" />
                                                                                    </FormButton>
                                                                                </Tooltip>
                                                                                <Tooltip
                                                                                    :text="$t('plansandgoals.table.actions.graph')">
                                                                                    <FormButton class="rounded-md"
                                                                                        buttonSize="sm"
                                                                                        @click="openSubgoalChart(subgoal)">
                                                                                        <Icon name="ph:chart-line"
                                                                                            class="size-4" />
                                                                                    </FormButton>
                                                                                </Tooltip>
                                                                                <Tooltip
                                                                                    :text="$t('plansandgoals.table.actions.notes')">
                                                                                    <FormButton class="rounded-md"
                                                                                        buttonSize="sm"
                                                                                        @click="viewSubgoalStatuses(subgoal)">
                                                                                        <Icon
                                                                                            name="ph:check-square-offset"
                                                                                            class="size-4" />
                                                                                    </FormButton>
                                                                                </Tooltip>
                                                                                <Tooltip
                                                                                    :text="$t('plansandgoals.table.actions.notifications')">
                                                                                    <FormButton class="rounded-md"
                                                                                        buttonSize="sm"
                                                                                        @click="viewSubgoalNotifications(subgoal)">
                                                                                        <Icon name="ph:bell"
                                                                                            class="size-4" />
                                                                                    </FormButton>
                                                                                </Tooltip>
                                                                                <Tooltip
                                                                                    :text="$t('plansandgoals.table.actions.delete')"
                                                                                    v-if="subgoal?.is_deletable">
                                                                                    <FormButton class="rounded-md"
                                                                                        buttonSize="sm"
                                                                                        @click="confirmSubgoalDeletion(subgoal)">
                                                                                        <Icon name="ph:trash"
                                                                                            class="size-4" />
                                                                                    </FormButton>
                                                                                </Tooltip>
                                                                            </div>
                                                                        </div>
                                                                        <div class="space-y-1">
                                                                            <div v-html="subgoal?.description"
                                                                                class="content text-sm" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </dl>
                                                        </div>
                                                    </DisclosurePanel>
                                                </Disclosure>
                                                <div v-if="state.goals?.data?.length === 0">
                                                    <p class="text-center">
                                                        {{ $t('theresNoDataAvailableToDisplay') }}.
                                                    </p>
                                                </div>
                                            </dl>
                                        </LoadingSpinner>
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </div>
            <ModulesUserCitizenPlanGoalModalNew :isModalOpen="state.modal.isAddGoalOpen"
                :selectedPlan="state.selectedPlan" @close="state.modal.isAddGoalOpen = false"
                @refreshGoals="fetchGoals" />
            <ModulesUserCitizenPlanGoalModalEdit :isModalOpen="state.modal.isEditGoalOpen"
                :selectedPlan="state.selectedPlan" :selectedGoal="state.selectedGoal"
                @close="state.modal.isEditGoalOpen = false" @refreshGoals="fetchGoals" />
            <ModulesUserCitizenPlanGoalSubgoalModalNew :isModalOpen="state.modal.isAddSubgoalOpen"
                :selectedGoal="state.selectedGoal" @close="state.modal.isAddSubgoalOpen = false"
                @refreshGoals="fetchGoals" />
            <ModulesUserCitizenPlanGoalSubgoalModalEdit :isModalOpen="state.modal.isEditSubgoalOpen"
                :selectedGoal="state.selectedGoal" :selectedSubgoal="state.selectedSubgoal"
                @close="state.modal.isEditSubgoalOpen = false" @refreshGoals="fetchGoals" />

            <ModulesUserCitizenPlanChartModalChart :isModalOpen="state.modal.isGoalChartOpen"
                :selectedData="state.selectedGoal" @close="state.modal.isGoalChartOpen = false" />
            <ModulesUserCitizenPlanChartModalChart :isModalOpen="state.modal.isSubgoalChartOpen"
                :selectedData="state.selectedSubgoal" @close="state.modal.isSubgoalChartOpen = false" />

            <ModulesUserCitizenPlanNotesModalNotes :isModalOpen="state.modal.isGoalStatusesOpen"
                :selectedData="state.selectedGoal" @close="closeGoalStatusesModal" @refreshData="fetchGoals" />
            <ModulesUserCitizenPlanNotesModalNotes :isModalOpen="state.modal.isSubGoalStatusesOpen"
                :selectedData="state.selectedSubgoal" @close="closeSubgoalStatusesModal" @refreshData="fetchGoals" />

            <ModulesUserCitizenPlanNotificationModalNotifications :isModalOpen="state.modal.isGoalNotificationsOpen"
                :selectedData="state.selectedGoal" @close="state.modal.isGoalNotificationsOpen = false" />
            <ModulesUserCitizenPlanNotificationModalNotifications :isModalOpen="state.modal.isSubgoalNotificationsOpen"
                :selectedData="state.selectedSubgoal" @close="state.modal.isSubgoalNotificationsOpen = false" />

            <DialogConfirmation :isModalOpen="state.modal.isArchiveGoalOpen"
                :message="`${$t('plansandgoals.confirmation.archiveGoalConfirmation')}?`"
                @close="state.modal.isArchiveGoalOpen = false" @confirm="archiveGoal" />
            <DialogConfirmation :isModalOpen="state.modal.isArchiveSubgoalOpen"
                :message="`${$t('plansandgoals.confirmation.archiveSubgoalConfirmation')}?`"
                @close="state.modal.isArchiveSubgoalOpen = false" @confirm="archiveSubgoal" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteGoalOpen"
                :message="`${$t('plansandgoals.confirmation.deleteGoalConfirmation')}?`"
                @close="state.modal.isDeleteGoalOpen = false" @confirm="deleteGoal" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteSubgoalOpen"
                :message="`${$t('plansandgoals.confirmation.deleteSubgoalConfirmation')}?`"
                @close="state.modal.isDeleteSubgoalOpen = false" @confirm="deleteSubgoal" />
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { goalService } from '@/components/api/user/GoalService'
import { subgoalService } from '@/components/api/user/SubgoalService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()
const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
    selectedPlan: {
        type: Object,
        required: true,
    },
})
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    goals: [] as any,
    modal: {
        isAddGoalOpen: false,
        isAddSubgoalOpen: false,
        isArchiveGoalOpen: false,
        isArchiveSubgoalOpen: false,
        isDeleteGoalOpen: false,
        isDeleteSubgoalOpen: false,
        isEditGoalOpen: false,
        isEditSubgoalOpen: false,
        isGoalChartOpen: false,
        isGoalNotificationsOpen: false,
        isGoalStatusesOpen: false,
        isSubgoalChartOpen: false,
        isSubgoalNotificationsOpen: false,
        isSubGoalStatusesOpen: false,
    },
    selectedPlan: {
        id: '',
        uuid: '',
        name: '',
        description: '',
        completion_date: '',
        date_completed: '',
        is_completed: false,
    },
    selectedGoal: {
        id: '',
        uuid: '',
        name: '',
        description: '',
        completion_date: '',
        date_completed: '',
        is_completed: false,
    },
    selectedSubgoal: {
        id: '',
        uuid: '',
        name: '',
        description: '',
        completion_date: '',
        date_completed: '',
        is_completed: false,
    },
    isPageLoading: false,
})

function closeSlide() {
    emit('close')
}

function hasCreateGoalsAccess() {
    const user = userStore.getUser
    const hasAdminAccess = isAdmin(user?.roles)
    const employeeCanCreateGoals = user?.company?.employee_create_goals_enabled
    if (hasAdminAccess) {
        return true
    } else if (employeeCanCreateGoals) {
        return true
    }
    return false
}

function hasCreateSubgoalsAccess() {
    const user = userStore.getUser
    const hasAdminAccess = isAdmin(user?.roles)
    const employeeCanCreateSubgoals = user?.company?.employee_create_subgoals_enabled
    if (hasAdminAccess) {
        return true
    } else if (employeeCanCreateSubgoals) {
        return true
    }
    return false
}

function isAdmin(roles: any) {
    return roles && roles.some((role: any) => role.name === 'Admin')
}

watch(() => props.selectedPlan, (newValue: any) => {
    if (newValue != null) {
        state.selectedPlan = {
            id: newValue.id,
            uuid: newValue.uuid,
            name: newValue.name,
            description: newValue.description,
            completion_date: newValue.completion_date,
            date_completed: newValue.date_completed,
            is_completed: newValue.is_completed,
        }
        fetchGoals()
    }
})

async function fetchGoals() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            plan_uuid: state.selectedPlan.uuid,
        }
        const response = await goalService.getGoals(params)
        if (response) {
            state.goals = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function addSubgoal(goal: any) {
    state.selectedGoal = goal
    state.modal.isAddSubgoalOpen = true
}

function editGoal(goal: any) {
    state.selectedGoal = goal
    state.modal.isEditGoalOpen = true
}

function editSubGoal(subgoal: any) {
    state.selectedSubgoal = subgoal
    state.modal.isEditSubgoalOpen = true
}

function openGoalChart(goal: any) {
    state.selectedGoal = goal
    state.modal.isGoalChartOpen = true
}

function openSubgoalChart(subgoal: any) {
    state.selectedSubgoal = subgoal
    state.modal.isSubgoalChartOpen = true
}

function viewGoalStatuses(goal: any) {
    state.selectedGoal = goal
    state.modal.isGoalStatusesOpen = true
}

function viewGoalNotifications(goal: any) {
    state.selectedGoal = goal
    state.modal.isGoalNotificationsOpen = true
}

function viewSubgoalStatuses(subgoal: any) {
    state.selectedSubgoal = subgoal
    state.modal.isSubGoalStatusesOpen = true
}

function viewSubgoalNotifications(subgoal: any) {
    state.selectedSubgoal = subgoal
    state.modal.isSubgoalNotificationsOpen = true
}

function closeGoalStatusesModal() {
    state.modal.isGoalStatusesOpen = false
    state.selectedGoal = {
        id: '',
        uuid: '',
        name: '',
        description: '',
        completion_date: '',
        date_completed: '',
        is_completed: false,
    }
}

function closeSubgoalStatusesModal() {
    state.modal.isSubGoalStatusesOpen = false
    state.selectedSubgoal = {
        id: '',
        uuid: '',
        name: '',
        description: '',
        completion_date: '',
        date_completed: '',
        is_completed: false,
    }
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
            fetchGoals()
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.goalSuccessfullyArchived')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function confirmSubgoalArchive(subgoal: any) {
    state.selectedSubgoal = subgoal
    state.modal.isArchiveSubgoalOpen = true
}

async function archiveSubgoal() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await subgoalService.archiveUnarchiveSubgoal(state.selectedSubgoal.uuid)
        if (response?.data) {
            fetchGoals()
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.subgoalSuccessfullyArchived')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function confirmGoalDeletion(goal: any) {
    state.selectedGoal = goal
    state.modal.isDeleteGoalOpen = true
}

async function deleteGoal() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await goalService.deleteGoal(state.selectedGoal.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.goalSuccessfullyDeleted')}.`)
            fetchGoals()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function confirmSubgoalDeletion(subgoal: any) {
    state.selectedSubgoal = subgoal
    state.modal.isDeleteSubgoalOpen = true
}

async function deleteSubgoal() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await subgoalService.deleteSubgoal(state.selectedSubgoal.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.subgoalSuccessfullyDeleted')}.`)
            fetchGoals()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>