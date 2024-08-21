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
                                                {{ $t('plansandgoals.completionDate') }}:
                                                {{ formatDateToReadable(props.selectedPlan?.completion_date) }}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="relative flex-1 px-4 py-6 sm:px-6 space-y-3">
                                        <div class="flex justify-end items-center">
                                            <FormButton buttonStyle="action" class="rounded-md"
                                                @click="state.modal.isAddGoalOpen = true">
                                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                                {{ $t('plansandgoals.newGoal') }}
                                            </FormButton>
                                        </div>
                                        <LoadingSpinner :isActive="state.isPageLoading">
                                            <dl class="divide-y divide-tertiary divide-dashed">
                                                <Disclosure as="div" v-slot="{ open }"
                                                    v-for="(goal, index) in state.goals?.data" :index="index">
                                                    <div class="py-4">
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
                                                            <div class="flex gap-x-1">
                                                                <FormButton class="rounded-md" buttonSize="sm"
                                                                    @click="addSubgoal(goal)">
                                                                    <Icon name="ph:plus" class="size-4" />
                                                                    <span class="hidden md:block">
                                                                        {{ $t('plansandgoals.newSubgoal') }}
                                                                    </span>
                                                                </FormButton>
                                                                <FormButton class="rounded-md" buttonSize="sm"
                                                                    @click="editGoal(goal)">
                                                                    <Icon name="ph:pencil-duotone" class="size-4" />
                                                                    <span class="hidden md:block">
                                                                        {{ $t('plansandgoals.table.actions.edit') }}
                                                                    </span>
                                                                </FormButton>
                                                                <FormButton class="rounded-md" buttonSize="sm"
                                                                    @click="viewGoalStatuses(goal)">
                                                                    <Icon name="ph:check-square-offset"
                                                                        class="size-4" />
                                                                    {{ $t('plansandgoals.table.actions.statuses') }}
                                                                </FormButton>
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
                                                        <p class="text-sm">
                                                            {{ $t('plansandgoals.completionDate') }}:
                                                            {{ formatDateToReadable(goal?.completion_date) }}
                                                        </p>
                                                        <div class="text-sm">
                                                            {{ goal?.description }}
                                                        </div>
                                                    </div>
                                                    <DisclosurePanel as="dd" class="mx-5 my-0">
                                                        <div class="mb-6">
                                                            <p class="font-semibold text-sm py-1"
                                                                v-if="goal?.citizen_subgoals?.length > 0">
                                                                {{ $t('plansandgoals.subgoals') }}
                                                            </p>
                                                            <p class="text-sm py-1" v-else>
                                                                {{ $t('plansandgoals.noAvailableSubgoals') }}.
                                                            </p>
                                                            <dl class="space-y-2">
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
                                                                                <FormButton class="rounded-md"
                                                                                    buttonSize="sm"
                                                                                    @click="editSubGoal(subgoal)">
                                                                                    <Icon name="ph:pencil-duotone"
                                                                                        class="size-4" />
                                                                                    <span class="hidden md:block">
                                                                                        {{
                                                                                            $t('plansandgoals.table.actions.edit')
                                                                                        }}
                                                                                    </span>
                                                                                </FormButton>
                                                                                <FormButton class="rounded-md"
                                                                                    buttonSize="sm"
                                                                                    @click="viewSubgoalStatuses(subgoal)">
                                                                                    <Icon name="ph:check-square-offset"
                                                                                        class="size-4" />
                                                                                    <span class="hidden md:block">
                                                                                        {{
                                                                                            $t('plansandgoals.table.actions.statuses')
                                                                                        }}
                                                                                    </span>
                                                                                </FormButton>
                                                                            </div>
                                                                        </div>
                                                                        <div class="space-y-1">
                                                                            <div class="text-sm">
                                                                                {{ subgoal?.description }}
                                                                            </div>
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
            <ModulesCitizenPlanGoalModalNew :isModalOpen="state.modal.isAddGoalOpen" :selectedPlan="state.selectedPlan"
                @close="state.modal.isAddGoalOpen = false" @refreshGoals="fetchGoals" />
            <ModulesCitizenPlanGoalModalEdit :isModalOpen="state.modal.isEditGoalOpen"
                :selectedPlan="state.selectedPlan" :selectedGoal="state.selectedGoal"
                @close="state.modal.isEditGoalOpen = false" @refreshGoals="fetchGoals" />
            <ModulesCitizenPlanGoalSubgoalModalNew :isModalOpen="state.modal.isAddSubgoalOpen"
                :selectedGoal="state.selectedGoal" @close="state.modal.isAddSubgoalOpen = false"
                @refreshGoals="fetchGoals" />
            <ModulesCitizenPlanGoalSubgoalModalEdit :isModalOpen="state.modal.isEditSubgoalOpen"
                :selectedGoal="state.selectedGoal" :selectedSubgoal="state.selectedSubgoal"
                @close="state.modal.isEditSubgoalOpen = false" @refreshGoals="fetchGoals" />
            <ModulesCitizenPlanStatusModalStatuses :isModalOpen="state.modal.isGoalStatusesOpen"
                :selectedData="state.selectedGoal" @close="closeGoalStatusesModal" @refreshData="fetchGoals" />
            <ModulesCitizenPlanStatusModalStatuses :isModalOpen="state.modal.isSubGoalStatusesOpen"
                :selectedData="state.selectedSubgoal" @close="closeSubgoalStatusesModal" @refreshData="fetchGoals" />
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { goalService } from '@/components/api/GoalService'
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
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    goals: [] as any,
    modal: {
        isAddGoalOpen: false,
        isAddSubgoalOpen: false,
        isEditGoalOpen: false,
        isEditSubgoalOpen: false,
        isGoalStatusesOpen: false,
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

function viewGoalStatuses(goal: any) {
    state.selectedGoal = goal
    state.modal.isGoalStatusesOpen = true
}

function viewSubgoalStatuses(subgoal: any) {
    state.selectedSubgoal = subgoal
    state.modal.isSubGoalStatusesOpen = true
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
</script>