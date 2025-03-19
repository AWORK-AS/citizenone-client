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
                                                        {{ props.selectedGoal?.name }}
                                                    </h3>
                                                    <Badge
                                                        :type="props.selectedGoal?.is_completed ? 'active' : 'primary'">
                                                        <p class="text-xxs">
                                                            <span v-if="props.selectedGoal?.is_completed">
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
                                                    formatDateToReadable(props.selectedGoal?.created_at) }}
                                            </p>
                                            <p class="text-sm text-white">
                                                {{ $t('plansandgoals.completionDate') }}:
                                                {{ formatDateToReadable(props.selectedGoal?.completion_date) }}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="relative flex-1 px-4 py-6 sm:px-6 space-y-3">
                                        <div class="flex justify-end items-center">
                                            <FormButton buttonStyle="action" class="rounded-md"
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
                                                                    <FormButton class="rounded-md" buttonSize="sm"
                                                                        @click="editSubGoal(subgoal)">
                                                                        <Icon name="ph:pencil-duotone" class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip
                                                                    :text="$t('plansandgoals.table.actions.notifications')">
                                                                    <FormButton class="rounded-md" buttonSize="sm"
                                                                        @click="viewNotifications(subgoal)">
                                                                        <Icon name="ph:bell" class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip
                                                                    :text="$t('plansandgoals.table.actions.archive')">
                                                                    <FormButton class="rounded-md" buttonSize="sm"
                                                                        @click="confirmSubgoalArchive(subgoal)">
                                                                        <Icon name="ph:archive" class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip
                                                                    :text="$t('plansandgoals.table.actions.notes')">
                                                                    <FormButton class="rounded-md" buttonSize="sm"
                                                                        @click="viewSubgoalStatuses(subgoal)">
                                                                        <Icon name="ph:check-square-offset"
                                                                            class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip
                                                                    :text="$t('plansandgoals.table.actions.graph')">
                                                                    <FormButton class="rounded-md" buttonSize="sm"
                                                                        @click="openChart(subgoal)">
                                                                        <Icon name="ph:chart-line" class="size-4" />
                                                                    </FormButton>
                                                                </Tooltip>
                                                                <Tooltip
                                                                    :text="$t('plansandgoals.table.actions.delete')"
                                                                    v-if="subgoal?.is_deletable">
                                                                    <FormButton class="rounded-md" buttonSize="sm"
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
                :selectedGoal="props.selectedGoal" @close="state.modal.isAddSubgoalOpen = false"
                @refreshGoals="fetchSubgoals" />
            <ModulesUserCitizenPlanGoalSubgoalModalEdit :isModalOpen="state.modal.isEditSubgoalOpen"
                :selectedGoal="props.selectedGoal" :selectedSubgoal="state.selectedSubgoal"
                @close="state.modal.isEditSubgoalOpen = false" @refreshGoals="fetchSubgoals" />
            <ModulesUserCitizenPlanChartModalChart :isModalOpen="state.modal.isChartOpen"
                :selectedData="state.selectedSubgoal" @close="state.modal.isChartOpen = false" />
            <ModulesUserCitizenPlanStatusModalStatuses :isModalOpen="state.modal.isSubGoalStatusesOpen"
                :selectedData="state.selectedSubgoal" @close="closeSubgoalStatusesModal" @refreshData="fetchSubgoals" />
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
    selectedGoal: {
        type: Object,
        required: true,
    },
})
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
const emit = defineEmits(['close'])

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
        isSubGoalStatusesOpen: false,
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
})

function closeSlide() {
    emit('close')
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
        fetchSubgoals()
    }
})

async function fetchSubgoals() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            goal_uuid: props.selectedGoal.uuid,
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

function viewSubgoalStatuses(subgoal: any) {
    state.selectedSubgoal = subgoal
    state.modal.isSubGoalStatusesOpen = true
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
</script>