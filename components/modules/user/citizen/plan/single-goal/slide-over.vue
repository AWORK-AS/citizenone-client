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
                                                        {{ state.selectedGoal?.name }}
                                                    </h3>
                                                    <Badge
                                                        :type="state.selectedGoal?.is_completed ? 'active' : 'primary'">
                                                        <p class="text-xxs">
                                                            <span v-if="state.selectedGoal?.is_completed">
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
                                                    formatDateToReadable(state.selectedGoal?.created_at) }}
                                            </p>
                                            <p class="text-sm text-white">
                                                {{ $t('plansandgoals.completionDate') }}:
                                                {{ formatDateToReadable(state.selectedGoal?.completion_date) }}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="relative flex-1 px-4 py-6 sm:px-6 space-y-3">
                                        <!-- Strong client wish (Jeanette/Birketoften): switching which active goal's
                                             sub-goals are shown here, without closing this panel and reopening it
                                             from a different goal card. Only offered when there is more than this
                                             one goal to switch to. -->
                                        <div class="space-y-1" v-if="state.otherActiveGoals.length > 0">
                                            <FormLabel for="single_goal_switch" :label="$t('plansandgoals.switchGoal')" />
                                            <FormSelect id="single_goal_switch" :options="goalSwitchOptions"
                                                v-model="state.activeGoalUuid" />
                                        </div>
                                        <div class="flex justify-end items-center gap-x-2">
                                            <FormButton buttonStyle="action" @click="assignSurveyTo('goal', state.selectedGoal)">
                                                <Icon name="ph:clipboard-text" class="h-4 w-4" aria-hidden="true" />
                                                {{ $t('surveys.assignSurvey') }}
                                            </FormButton>
                                            <FormButton buttonStyle="action"
                                                @click="state.modal.isAddSubgoalOpen = true"
                                                v-if="hasCreateSubgoalsAccess()">
                                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                                {{ $t('plansandgoals.newSubgoal') }}
                                            </FormButton>
                                        </div>
                                        <LoadingSpinner :isActive="state.isPageLoading">
                                            <dl class="space-y-5">
                                                <div v-for="(subgoal, index) in state.subgoals?.data" :index="index"
                                                    class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary">
                                                    <div>
                                                        <div class="flex justify-between items-center">
                                                            <div>
                                                                <div class="flex items-center gap-x-2">
                                                                    <h3 class="text-lg font-semibold">
                                                                        {{ subgoal?.name }}
                                                                    </h3>
                                                                    <div>
                                                                        <Badge
                                                                            :type="subgoal?.date_completed ? 'active' : 'primary'">
                                                                            <p class="text-xxs truncate">
                                                                                <span v-if="subgoal?.date_completed">
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
                                                                <Tooltip :text="$t('plansandgoals.table.actions.edit')"
                                                                    v-if="subgoal?.is_editable">
                                                                    <FormButton :aria-label="$t('plansandgoals.table.actions.edit')" buttonSize="sm"
                                                                        @click="editSubGoal(subgoal)">
                                                                        <Icon name="ph:pencil-duotone" class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip :text="$t('surveys.assignSurvey')">
                                                                    <FormButton :aria-label="$t('surveys.assignSurvey')" buttonSize="sm"
                                                                        @click="assignSurveyTo('subgoal', subgoal)">
                                                                        <Icon name="ph:clipboard-text" class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip
                                                                    :text="$t('plansandgoals.table.actions.notifications')">
                                                                    <FormButton :aria-label="$t('plansandgoals.table.actions.notifications')" buttonSize="sm"
                                                                        @click="viewNotifications(subgoal)">
                                                                        <Icon name="ph:bell" class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip
                                                                    :text="$t('plansandgoals.table.actions.archive')">
                                                                    <FormButton :aria-label="$t('plansandgoals.table.actions.archive')" buttonSize="sm"
                                                                        @click="confirmSubgoalArchive(subgoal)">
                                                                        <Icon name="ph:archive" class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip
                                                                    :text="$t('plansandgoals.table.actions.notes')">
                                                                    <FormButton :aria-label="$t('plansandgoals.table.actions.notes')" buttonSize="sm"
                                                                        @click="viewSubgoalNotes(subgoal)">
                                                                        <Icon name="ph:check-square-offset"
                                                                            class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip
                                                                    :text="$t('plansandgoals.table.actions.reports')">
                                                                    <FormButton :aria-label="$t('plansandgoals.table.actions.reports')" buttonSize="sm"
                                                                        @click="viewStatuses(subgoal)">
                                                                        <Icon name="ph:file" class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip
                                                                    :text="$t('plansandgoals.table.actions.graph')">
                                                                    <FormButton :aria-label="$t('plansandgoals.table.actions.graph')" buttonSize="sm"
                                                                        @click="openChart(subgoal)">
                                                                        <Icon name="ph:chart-line" class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip
                                                                    :text="$t('plansandgoals.table.actions.delete')"
                                                                    v-if="subgoal?.is_deletable">
                                                                    <FormButton :aria-label="$t('plansandgoals.table.actions.delete')" buttonSize="sm"
                                                                        @click="confirmSubgoalDeletion(subgoal)">
                                                                        <Icon name="ph:trash" class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                            </div>
                                                        </div>
                                                        <div class="mt-1">
                                                            <Badge type="primary" class="w-fit" v-if="subgoal.score">
                                                                <p class="text-xxs" v-if="subgoal.score == 1">
                                                                    {{
                                                                        $t('plansandgoals.table.expectedLevels.minorChallenges')
                                                                    }}
                                                                </p>
                                                                <p class="text-xxs" v-if="subgoal.score == 2">
                                                                    {{
                                                                        $t('plansandgoals.table.expectedLevels.moderateChallenges')
                                                                    }}
                                                                </p>
                                                                <p class="text-xxs" v-if="subgoal.score == 3">
                                                                    {{
                                                                        $t('plansandgoals.table.expectedLevels.significantChallenges')
                                                                    }}
                                                                </p>
                                                                <p class="text-xxs" v-if="subgoal.score == 4">
                                                                    {{
                                                                        $t('plansandgoals.table.expectedLevels.severeChallenges')
                                                                    }}
                                                                </p>
                                                                <p class="text-xxs" v-if="subgoal.score == 5">
                                                                    {{
                                                                        $t('plansandgoals.table.expectedLevels.verySubstantialChallenges')
                                                                    }}
                                                                </p>
                                                            </Badge>
                                                        </div>
                                                        <p class="text-sm">
                                                            {{ $t('plansandgoals.dateCreated') }}: {{
                                                                formatDateToReadable(subgoal?.created_at) }}
                                                        </p>
                                                        <p class="text-sm">
                                                            {{ $t('plansandgoals.completionDate') }}:
                                                            {{ formatDateToReadable(subgoal?.completion_date) }}
                                                        </p>
                                                        <div v-html="subgoal?.description" class="content text-sm" />
                                                    </div>
                                                </div>
                                                <div v-if="state.subgoals?.data?.length === 0">
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
            <ModulesUserCitizenPlanGoalSubgoalModalNew :isModalOpen="state.modal.isAddSubgoalOpen"
                :selectedGoal="state.selectedGoal" @close="state.modal.isAddSubgoalOpen = false"
                @refreshGoals="fetchSubgoals" />
            <ModulesUserCitizenPlanGoalSubgoalModalEdit :isModalOpen="state.modal.isEditSubgoalOpen"
                :selectedGoal="state.selectedGoal" :selectedSubgoal="state.selectedSubgoal"
                @close="state.modal.isEditSubgoalOpen = false" @refreshGoals="fetchSubgoals" />
            <ModulesUserCitizenPlanChartModalChart :isModalOpen="state.modal.isChartOpen"
                :selectedData="state.selectedSubgoal" @close="state.modal.isChartOpen = false" />
            <ModulesUserCitizenPlanNotesModalNotes :isModalOpen="state.modal.isSubGoalNotesOpen"
                :selectedData="state.selectedSubgoal" @close="closeSubgoalStatusesModal" @refreshData="fetchSubgoals" />
            <ModulesUserCitizenPlanStatusTemplateModalStatuses :isModalOpen="state.modal.isViewStatuses"
                :selectedData="state.selectedSubgoal" @close="closeStatusesModal" />
            <ModulesUserCitizenPlanNotificationModalNotifications :isModalOpen="state.modal.isNotificationsOpen"
                :selectedData="state.selectedSubgoal" @close="state.modal.isNotificationsOpen = false" />
            <DialogConfirmation :isModalOpen="state.modal.isArchiveSubgoalOpen"
                :message="`${$t('plansandgoals.confirmation.archiveSubgoalConfirmation')}?`"
                @close="state.modal.isArchiveSubgoalOpen = false" @confirm="archiveSubgoal" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteSubgoalOpen"
                :message="`${$t('plansandgoals.confirmation.deleteSubgoalConfirmation')}?`"
                @close="state.modal.isDeleteSubgoalOpen = false" @confirm="deleteSubgoal" />
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { goalService } from '@/components/api/user/GoalService'
import { subgoalService } from '@/components/api/user/SubgoalService'
import { useUserStore } from '@/store/user'
import { usePermissions } from '@/composables/usePermissions'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()
const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
    selectedGoal: {
        type: Object,
        required: true,
    },
    // Most callers live under /citizens/[uuid]/... and don't need to pass
    // this - it's read from the route. The daily-overview widget lists goals
    // across every citizen at once, so its route carries no citizen uuid;
    // that caller passes this explicitly (from the goal/plan row's own
    // citizen) so the goal switcher below still has one to fetch siblings with.
    citizenUuid: {
        type: String,
        default: '',
    },
})
const userStore = useUserStore() as any
const { isAtLeast, can } = usePermissions()
const { successAlert } = useAlert()
const { t } = useI18n()
const emit = defineEmits(['close'])
const route = useRoute()
const citizenUuid = computed(() => props.citizenUuid || (route?.params?.uuid as string) || '')

function assignSurveyTo(type: 'goal' | 'subgoal', entity: any) {
    navigateTo(`/citizens/${citizenUuid.value}/surveys?link_type=${type}&link_uuid=${entity?.uuid}`)
}

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isArchiveSubgoalOpen: false,
        isAddSubgoalOpen: false,
        isChartOpen: false,
        isDeleteSubgoalOpen: false,
        isEditSubgoalOpen: false,
        isNotificationsOpen: false,
        isSubGoalNotesOpen: false,
        isViewStatuses: false,
    },
    selectedGoal: {},
    selectedSubgoal: {
        id: '',
        uuid: '',
        name: '',
        description: '',
        completion_date: '',
        date_completed: '',
        is_completed: false,
    },
    subgoals: [] as any,
    // The "switch goal" picker's own selection, and the pool it is built
    // from - this goal's active siblings (excluding itself).
    activeGoalUuid: '',
    otherActiveGoals: [] as any[],
})

const goalSwitchOptions = computed(() => {
    const current = state.selectedGoal?.uuid
        ? [{ value: state.selectedGoal.uuid, label: state.selectedGoal.name }]
        : []
    const others = state.otherActiveGoals.map((goal: any) => ({ value: goal.uuid, label: goal.name }))
    return [...current, ...others]
})

function closeSlide() {
    emit('close')
}

function hasCreateSubgoalsAccess() {
    const user = userStore.getUser
    const hasAdminAccess = isAtLeast('Admin')
    const employeeCanCreateSubgoals = user?.company?.employee_create_subgoals_enabled
    if (hasAdminAccess) {
        return true
    } else if (employeeCanCreateSubgoals) {
        return true
    }
    return false
}


watch(() => props.selectedGoal, (newValue: any) => {
    if (newValue != null) {
        state.selectedGoal = {
            id: newValue.id,
            uuid: newValue.uuid,
            name: newValue.name,
            description: newValue.description,
            completion_date: newValue.completion_date,
            date_completed: newValue.date_completed,
            is_completed: newValue.is_completed,
        }
        state.activeGoalUuid = newValue.uuid
        fetchSubgoals()
        fetchOtherActiveGoals()
    }
})

// Picking a different goal from the switcher above re-points this whole
// slide-over at it, the same way opening it fresh from a different goal
// card would - fetchSubgoals() then loads that goal's own sub-goals.
watch(() => state.activeGoalUuid, (newUuid: any) => {
    if (!newUuid || newUuid === state.selectedGoal?.uuid) return
    const picked = state.otherActiveGoals.find((goal: any) => goal.uuid === newUuid)
    if (!picked) return

    state.selectedGoal = {
        id: picked.id,
        uuid: picked.uuid,
        name: picked.name,
        description: picked.description,
        completion_date: picked.completion_date,
        date_completed: picked.date_completed,
        is_completed: picked.is_completed,
    }
    fetchSubgoals()
    fetchOtherActiveGoals()
})

async function fetchOtherActiveGoals() {
    if (!citizenUuid.value) return
    try {
        const response = await goalService.getAllGoalsPerCitizen(citizenUuid.value)
        const goals = response?.data ?? []
        state.otherActiveGoals = goals.filter((goal: any) => goal.uuid !== state.selectedGoal?.uuid)
    } catch (error: any) {
        // The switcher is a convenience on top of the single goal already
        // shown, so it failing to load must not block viewing that goal.
    }
}

async function fetchSubgoals() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            goal_uuid: state.selectedGoal.uuid,
        }
        const response = await subgoalService.getSubgoals(params)
        if (response) {
            state.subgoals = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function editSubGoal(subgoal: any) {
    state.selectedSubgoal = subgoal
    state.modal.isEditSubgoalOpen = true
}

function viewSubgoalNotes(subgoal: any) {
    state.selectedSubgoal = subgoal
    state.modal.isSubGoalNotesOpen = true
}

function viewStatuses(subgoal: any) {
    state.selectedSubgoal = subgoal
    state.modal.isViewStatuses = true
}

function closeStatusesModal() {
    state.modal.isViewStatuses = false
}

function viewNotifications(subgoal: any) {
    state.selectedSubgoal = subgoal
    state.modal.isNotificationsOpen = true
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
            fetchSubgoals()
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.subgoalSuccessfullyArchived')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function openChart(subgoal: any) {
    state.selectedSubgoal = subgoal
    state.modal.isChartOpen = true
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
            fetchSubgoals()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function closeSubgoalStatusesModal() {
    state.modal.isSubGoalNotesOpen = false
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
</script>