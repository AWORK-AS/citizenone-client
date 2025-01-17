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
                                                {{ $t('plansandgoals.VUMTemplates.newGoal') }}
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
                                                                </div>
                                                            </div>
                                                            <div class="flex gap-x-2">
                                                                <FormButton class="rounded-md" buttonSize="sm"
                                                                    @click="addSubgoal(goal)">
                                                                    <Icon name="ph:plus" class="size-4" />
                                                                    <span class="hidden md:block">
                                                                        {{
                                                                            $t('plansandgoals.VUMTemplates.newSubgoal')
                                                                        }}
                                                                    </span>
                                                                </FormButton>
                                                                <FormButton class="rounded-md" buttonSize="sm"
                                                                    @click="editGoal(goal)">
                                                                    <Icon name="ph:pencil-duotone" class="size-4" />
                                                                    <span class="hidden md:block">
                                                                        {{
                                                                            $t('plansandgoals.VUMTemplates.table.actions.edit')
                                                                        }}
                                                                    </span>
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
                                                        <div v-html="goal?.description" class="content text-sm" />
                                                    </div>
                                                    <DisclosurePanel as="dd" class="mt-5 mx-5 my-0">
                                                        <div class="mb-6">
                                                            <p class="font-semibold text-sm py-1"
                                                                v-if="goal?.citizen_subgoals?.length > 0">
                                                                {{
                                                                    $t('plansandgoals.VUMTemplates.table.subgoalsTemplate')
                                                                }}
                                                            </p>
                                                            <p class="text-sm bg-tertiary-25 px-4 py-6 text-center rounded-md"
                                                                v-else>
                                                                {{
                                                                    $t('plansandgoals.VUMTemplates.table.noAvailableSubgoals')
                                                                }}.
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
                                                                                </div>
                                                                            </div>
                                                                            <div class="flex gap-x-1">
                                                                                <FormButton class="rounded-md"
                                                                                    buttonSize="sm"
                                                                                    @click="editSubGoal(subgoal)">
                                                                                    <Icon name="ph:pencil-duotone"
                                                                                        class="size-4" />
                                                                                    <span class="hidden md:block">
                                                                                        {{
                                                                                            $t('plansandgoals.VUMTemplates.table.actions.edit')
                                                                                        }}
                                                                                    </span>
                                                                                </FormButton>
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
            <ModulesVumTemplatePlanGoalModalNew :isModalOpen="state.modal.isAddGoalOpen"
                :selectedPlan="state.selectedPlan" @close="state.modal.isAddGoalOpen = false"
                @refreshTemplates="fetchGoals" />
            <ModulesVumTemplatePlanGoalModalEdit :isModalOpen="state.modal.isEditGoalOpen"
                :selectedPlan="state.selectedPlan" :selectedGoal="state.selectedGoal"
                @close="state.modal.isEditGoalOpen = false" @refreshTemplates="fetchGoals" />
            <ModulesVumTemplatePlanGoalSubgoalModalNew :isModalOpen="state.modal.isAddSubgoalOpen"
                :selectedGoal="state.selectedGoal" @close="state.modal.isAddSubgoalOpen = false"
                @refreshTemplates="fetchGoals" />
            <ModulesVumTemplatePlanGoalSubgoalModalEdit :isModalOpen="state.modal.isEditSubgoalOpen"
                :selectedGoal="state.selectedGoal" :selectedSubgoal="state.selectedSubgoal"
                @close="state.modal.isEditSubgoalOpen = false" @refreshTemplates="fetchGoals" />
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { goalTemplateService } from '@/components/api/GoalTemplateService'
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
    },
    selectedPlan: {
        id: '',
        uuid: '',
        name: '',
        description: '',
    },
    selectedGoal: {
        id: '',
        uuid: '',
        name: '',
        description: '',
    },
    selectedSubgoal: {
        id: '',
        uuid: '',
        name: '',
        description: '',
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
        }
        fetchGoals()
    }
})

async function fetchGoals() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            plan_template_uuid: state.selectedPlan.uuid,
        }
        const response = await goalTemplateService.getTemplates(params)
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
</script>