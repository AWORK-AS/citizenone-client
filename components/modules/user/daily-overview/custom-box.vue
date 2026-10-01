<template>
    <section class="card" :aria-labelledby="`custom-box-${props.box.uuid}`">
        <div class="card-header">
            <div class="flex items-center gap-x-2 min-w-0">
                <Icon :name="sourceIcon" class="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <h3 :id="`custom-box-${props.box.uuid}`" class="truncate text-sm font-semibold text-slate-900">
                    {{ props.box.title }}
                </h3>
                <span class="badge badge-blue" v-if="!state.isLoading">{{ state.items.length }}</span>
                <Icon v-if="props.box.state === 'mandatory'" name="ph:lock-simple"
                    class="h-3.5 w-3.5 shrink-0 text-slate-400" :aria-label="$t('dailyOverviewLayouts.requiredByAdmin')" />
            </div>
        </div>

        <LoadingSpinner :isActive="state.isLoading" class="card-body min-h-24">
            <p v-if="state.error" class="px-1 py-6 text-center text-sm text-slate-500">
                {{ $t('dailyOverviewLayouts.box.loadFailed') }}
            </p>
            <p v-else-if="!state.isLoading && state.items.length === 0" class="px-1 py-6 text-center text-sm text-slate-500">
                {{ props.box.source === 'plans_and_goals' ? $t('dailyOverviewLayouts.box.noPlans') : $t('dailyOverviewLayouts.box.noCitizens') }}
            </p>

            <!-- My assigned citizens -->
            <ul v-else-if="props.box.source === 'assigned_citizens'" class="max-h-96 divide-y divide-surface-100 overflow-y-auto">
                <li v-for="citizen in state.items" :key="citizen.uuid">
                    <NuxtLink :to="`/citizens/${citizen.uuid}/journals`"
                        class="flex items-center gap-x-3 rounded-lg px-2 py-2.5 hover:bg-surface-50 transition-colors">
                        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary">
                            {{ initials(citizen) }}
                        </span>
                        <span class="min-w-0 flex-1">
                            <span class="block truncate text-sm font-medium text-slate-900">{{ fullName(citizen) }}</span>
                            <span v-if="citizen.departments?.length" class="block truncate text-xs text-slate-500">
                                {{ citizen.departments.map((department: any) => department.name).join(', ') }}
                            </span>
                        </span>
                        <Icon name="ph:caret-right" class="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    </NuxtLink>
                </li>
            </ul>

            <!-- Plans, goals and sub-goals per citizen -->
            <ul v-else-if="props.box.source === 'plans_and_goals'" class="max-h-[32rem] space-y-2 overflow-y-auto">
                <li v-for="citizen in state.items" :key="citizen.uuid" class="rounded-lg border border-surface-200">
                    <button type="button" @click="toggleCitizen(citizen.uuid)" :aria-expanded="isOpen(citizen.uuid)"
                        class="flex w-full items-center gap-x-3 px-3 py-2.5 text-left hover:bg-surface-50 transition-colors rounded-lg">
                        <Icon :name="isOpen(citizen.uuid) ? 'ph:caret-down' : 'ph:caret-right'"
                            class="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                        <span class="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">{{ fullName(citizen) }}</span>
                        <span v-if="citizen.next_due" :class="['badge shrink-0', dueBadge(citizen.next_due)]">
                            {{ dueLabel(citizen.next_due) }}
                        </span>
                    </button>

                    <div v-if="isOpen(citizen.uuid)" class="space-y-3 border-t border-surface-100 px-3 pb-3 pt-2">
                        <div v-for="plan in citizen.plans" :key="plan.uuid">
                            <NuxtLink :to="planLink(citizen, { plan: plan.uuid })"
                                class="group flex items-center gap-x-2 text-sm font-semibold text-slate-800 hover:text-primary">
                                <Icon name="ph:clipboard-text" class="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                                <span class="truncate">{{ plan.name }}</span>
                                <span v-if="plan.completion_date" :class="['badge shrink-0', itemBadge(plan)]">{{ itemDate(plan) }}</span>
                            </NuxtLink>
                            <ul class="mt-1 space-y-1 border-l border-surface-200 pl-4 ml-2">
                                <li v-for="goal in plan.goals" :key="goal.uuid">
                                    <ModulesUserDailyOverviewCustomBoxGoal :goal="goal" :to="planLink(citizen, { plan: plan.uuid })" />
                                </li>
                            </ul>
                        </div>
                        <div v-if="citizen.single_goals?.length">
                            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
                                {{ $t('plansandgoals.categories.singleGoal') }}
                            </p>
                            <ul class="mt-1 space-y-1">
                                <li v-for="goal in citizen.single_goals" :key="goal.uuid">
                                    <ModulesUserDailyOverviewCustomBoxGoal :goal="goal" :to="planLink(citizen, { goal: goal.uuid })" />
                                </li>
                            </ul>
                        </div>
                    </div>
                </li>
            </ul>
        </LoadingSpinner>
    </section>
</template>

<script setup lang="ts">
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { useDepartmentStore } from '@/store/department'
import { useDueDate } from '@/composables/useDailyOverviewDueDate'

const props = defineProps({
    box: {
        type: Object,
        required: true,
    },
})

const departmentStore = useDepartmentStore() as any
const { dueBadge, dueLabel, itemBadge, itemDate } = useDueDate()

const state = reactive({
    isLoading: false,
    error: false,
    items: [] as any[],
    // Citizens opened in the plans box. The first one starts open so the box
    // shows something at a glance without a click.
    open: new Set<string>(),
})

const sourceIcon = computed(() => props.box.source === 'plans_and_goals' ? 'ph:target' : 'ph:users-three')

onMounted(fetchData)
watch(() => departmentStore.getSelectedDepartmentName, fetchData)
watch(() => props.box.settings, fetchData, { deep: true })

async function fetchData() {
    state.isLoading = true
    state.error = false
    try {
        const response = await dailyOverviewService.getCustomBoxData(props.box.uuid)
        state.items = response?.data?.items ?? []
        if (state.open.size === 0 && state.items[0]) state.open.add(state.items[0].uuid)
    } catch {
        state.error = true
        state.items = []
    }
    state.isLoading = false
}

function isOpen(uuid: string) {
    return state.open.has(uuid)
}

function toggleCitizen(uuid: string) {
    if (state.open.has(uuid)) state.open.delete(uuid)
    else state.open.add(uuid)
}

function fullName(citizen: any) {
    return [citizen?.firstname, citizen?.lastname].filter(Boolean).join(' ')
}

function initials(citizen: any) {
    return [citizen?.firstname, citizen?.lastname].map((part) => part?.[0] ?? '').join('').toUpperCase()
}

/** The citizen's active plans page, opening the plan or single goal that was clicked. */
function planLink(citizen: any, query: Record<string, string>) {
    return { path: `/citizens/${citizen.uuid}/plans-and-goals/active`, query }
}
</script>
