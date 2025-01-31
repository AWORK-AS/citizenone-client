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
                                                        {{ $t('citizens.treatments.treatments') }}
                                                    </h3>
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
                                    </div>
                                    <div class="relative flex-1 px-4 py-6 sm:px-6 space-y-3">
                                        <div class="flex justify-end items-center">
                                            <FormButton buttonStyle="action" class="rounded-md"
                                                @click="state.modal.isAddGoalOpen = true">
                                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                                {{ $t('citizens.treatments.newTreatment') }}
                                            </FormButton>
                                        </div>
                                        <LoadingSpinner :isActive="state.isPageLoading">
                                            <dl class="space-y-5">
                                                <div v-for="(goal, index) in state.goals?.data" :index="index"
                                                    class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary">
                                                    <div>
                                                        <Badge type="primary" class="w-fit">
                                                            <p class="text-xxs truncate">
                                                                <span v-if="goal?.area_type === 'functional_level'">
                                                                    {{
                                                                        $t('citizens.treatments.table.areaTypes.functionalLevel')
                                                                    }}
                                                                </span>
                                                                <span
                                                                    v-if="goal?.area_type === 'musculoskeletal_system'">
                                                                    {{
                                                                        $t('citizens.treatments.table.areaTypes.musculoskeletalSystem')
                                                                    }}
                                                                </span>
                                                                <span v-if="goal?.area_type === 'nutrition'">
                                                                    {{
                                                                        $t('citizens.treatments.table.areaTypes.nutrition')
                                                                    }}
                                                                </span>
                                                                <span
                                                                    v-if="goal?.area_type === 'skin_and_mucous_membranes'">
                                                                    {{
                                                                        $t('citizens.treatments.table.areaTypes.skinAndMucousMembranes')
                                                                    }}
                                                                </span>
                                                                <span v-if="goal?.area_type === 'communication'">
                                                                    {{
                                                                        $t('citizens.treatments.table.areaTypes.communication')
                                                                    }}
                                                                </span>
                                                                <span
                                                                    v-if="goal?.area_type === 'psychosocial_conditions'">
                                                                    {{
                                                                        $t('citizens.treatments.table.areaTypes.psychosocialConditions')
                                                                    }}
                                                                </span>
                                                                <span
                                                                    v-if="goal?.area_type === 'respiration_and_circulation'">
                                                                    {{
                                                                        $t('citizens.treatments.table.areaTypes.respirationAndCirculation')
                                                                    }}
                                                                </span>
                                                                <span v-if="goal?.area_type === 'sexuality'">
                                                                    {{
                                                                        $t('citizens.treatments.table.areaTypes.sexuality')
                                                                    }}
                                                                </span>
                                                                <span
                                                                    v-if="goal?.area_type === 'pain_and_sensory_impressions'">
                                                                    {{
                                                                        $t('citizens.treatments.table.areaTypes.painAndSensoryImpressions')
                                                                    }}
                                                                </span>
                                                                <span v-if="goal?.area_type === 'sleep_and_rest'">
                                                                    {{
                                                                        $t('citizens.treatments.table.areaTypes.sleepAndRest')
                                                                    }}
                                                                </span>
                                                                <span
                                                                    v-if="goal?.area_type === 'knowledge_and_development'">
                                                                    {{
                                                                        $t('citizens.treatments.table.areaTypes.knowledgeAndDevelopment')
                                                                    }}
                                                                </span>
                                                                <span v-if="goal?.area_type === 'excretion_of_waste'">
                                                                    {{
                                                                        $t('citizens.treatments.table.areaTypes.excretionOfWaste')
                                                                    }}
                                                                </span>
                                                            </p>
                                                        </Badge>
                                                        <div class="flex justify-between items-center">
                                                            <div>
                                                                <div class="flex items-center gap-x-2">
                                                                    <h3 class="text-lg font-semibold">
                                                                        {{ goal?.title }}
                                                                    </h3>
                                                                    <div>
                                                                        <Badge
                                                                            :type="goal?.date_completed ? 'active' : 'primary'">
                                                                            <p class="text-xxs truncate">
                                                                                <span v-if="goal?.date_completed">
                                                                                    {{
                                                                                        $t('citizens.treatments.table.completed')
                                                                                    }}
                                                                                </span>
                                                                                <span v-else>
                                                                                    {{
                                                                                        $t('citizens.treatments.table.inProgress')
                                                                                    }}
                                                                                </span>
                                                                            </p>
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="flex gap-x-2">
                                                                <FormButton class="rounded-md" buttonSize="sm"
                                                                    @click="editGoal(goal)">
                                                                    <Icon name="ph:pencil-duotone" class="size-4" />
                                                                    <span class="hidden md:block">
                                                                        {{
                                                                            $t('citizens.treatments.table.actions.edit')
                                                                        }}
                                                                    </span>
                                                                </FormButton>
                                                                <FormButton class="rounded-md" buttonSize="sm"
                                                                    @click="viewGoalStatuses(goal)">
                                                                    <Icon name="ph:check-square-offset"
                                                                        class="size-4" />
                                                                    <span class="hidden md:block">
                                                                        {{
                                                                            $t('citizens.treatments.table.actions.statuses')
                                                                        }}
                                                                    </span>
                                                                </FormButton>
                                                            </div>
                                                        </div>
                                                        <div class="mt-1">
                                                            <Badge type="primary" class="w-fit" v-if="goal.score">
                                                                <p class="text-xxs" v-if="goal.score == 1">
                                                                    {{
                                                                        $t('citizens.treatments.table.expectedLevels.minorChallenges')
                                                                    }}
                                                                </p>
                                                                <p class="text-xxs" v-if="goal.score == 2">
                                                                    {{
                                                                        $t('citizens.treatments.table.expectedLevels.moderateChallenges')
                                                                    }}
                                                                </p>
                                                                <p class="text-xxs" v-if="goal.score == 3">
                                                                    {{
                                                                        $t('citizens.treatments.table.expectedLevels.significantChallenges')
                                                                    }}
                                                                </p>
                                                                <p class="text-xxs" v-if="goal.score == 4">
                                                                    {{
                                                                        $t('citizens.treatments.table.expectedLevels.severeChallenges')
                                                                    }}
                                                                </p>
                                                                <p class="text-xxs" v-if="goal.score == 5">
                                                                    {{
                                                                        $t('citizens.treatments.table.expectedLevels.verySubstantialChallenges')
                                                                    }}
                                                                </p>
                                                            </Badge>
                                                        </div>
                                                        <p class="text-sm">
                                                            {{ $t('citizens.treatments.table.dateCreated') }}: {{
                                                                formatDateToReadable(goal?.created_at) }}
                                                        </p>
                                                        <p class="text-sm">
                                                            {{ $t('citizens.treatments.table.completionDate') }}:
                                                            {{ formatDateToReadable(goal?.completion_date) }}
                                                        </p>
                                                        <div v-html="goal?.description" class="content text-sm" />
                                                    </div>
                                                </div>
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
            <ModulesCitizenTreatmentModalNew :isModalOpen="state.modal.isAddGoalOpen"
                :selectedRecord="state.selectedRecord" @close="state.modal.isAddGoalOpen = false"
                @refreshGoals="fetchGoals" />
            <ModulesCitizenTreatmentModalEdit :isModalOpen="state.modal.isEditGoalOpen"
                :selectedRecord="state.selectedRecord" :selectedGoal="state.selectedGoal"
                @close="state.modal.isEditGoalOpen = false" @refreshGoals="fetchGoals" />
            <ModulesCitizenTreatmentStatusModalStatuses :isModalOpen="state.modal.isGoalStatusesOpen"
                :selectedData="state.selectedGoal" @close="closeGoalStatusesModal" @refreshData="fetchGoals" />
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { nursingAreaGoalService } from '@/components/api/NursingAreaGoalService'
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()
const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
    selectedRecord: {
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
    selectedRecord: {
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

watch(() => props.selectedRecord, (newValue: any) => {
    if (newValue != null) {
        state.selectedRecord = {
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
            nursing_area_uuid: state.selectedRecord.uuid,
        }
        const response = await nursingAreaGoalService.getNursingAreaGoals(params)
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