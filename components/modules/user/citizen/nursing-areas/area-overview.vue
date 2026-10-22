<template>
    <section class="bg-white ring-1 ring-gray-200 rounded-md border-t-3 border-secondary px-5 py-6">
        <div class="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <div>
                <h3 class="font-semibold text-sm">{{ $t('citizens.nursingAreas.areaOverview.title') }}</h3>
                <p class="text-xs text-gray-500 mt-1">{{ $t('citizens.nursingAreas.areaOverview.description') }}</p>
            </div>
            <label class="flex items-center gap-x-2 text-xs text-gray-600 cursor-pointer select-none">
                <input type="checkbox" v-model="state.onlyActive" class="rounded border-gray-300 text-primary" />
                {{ $t('citizens.nursingAreas.areaOverview.onlyWithContent') }}
            </label>
        </div>

        <div v-if="state.isLoading" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div v-for="n in 6" :key="n" class="h-28 rounded-md bg-gray-100 animate-pulse" />
        </div>

        <p v-else-if="state.failed" class="text-sm text-red-600">{{ $t('citizens.nursingAreas.areaOverview.loadFailed') }}</p>

        <p v-else-if="visibleAreas.length === 0" class="text-sm text-gray-500">
            {{ $t('citizens.nursingAreas.areaOverview.nothingYet') }}
        </p>

        <ul v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <li v-for="area in visibleAreas" :key="area.area">
                <button type="button" :aria-expanded="isExpanded(area.area)"
                    class="w-full h-full text-left rounded-md ring-1 ring-gray-200 hover:ring-primary px-4 py-3 transition"
                    :class="hasContent(area) ? 'bg-white' : 'bg-gray-50'"
                    @click="toggle(area.area)">
                    <div class="flex items-start justify-between gap-2">
                        <p class="text-sm font-semibold text-gray-900">{{ careAreaLabel(area.area, t) }}</p>
                        <span v-if="area.status?.problem_status" :class="problemStatusClass(area.status.problem_status)"
                            class="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xxs font-medium">
                            {{ problemStatusLabel(area.status.problem_status) }}
                        </span>
                    </div>

                    <template v-if="hasContent(area)">
                        <p v-if="area.assessment" class="text-xs text-gray-700 mt-2 whitespace-pre-line"
                            :class="isExpanded(area.area) ? '' : 'line-clamp-3'">
                            {{ plainText(area.assessment.text) || plainText(area.assessment.note) }}
                        </p>
                        <p v-if="isExpanded(area.area) && area.assessment?.text && area.assessment?.note"
                            class="text-xs text-gray-500 mt-2 whitespace-pre-line">
                            {{ plainText(area.assessment.note) }}
                        </p>
                        <p v-if="area.assessment" class="text-xxs text-gray-400 mt-1">
                            {{ formatDateToReadable(area.assessment.date) }}<span v-if="area.assessment.author"> · {{ area.assessment.author }}</span>
                        </p>

                        <p v-if="isExpanded(area.area) && area.status?.status" class="text-xs text-gray-700 mt-2">
                            <span class="font-medium">{{ $t('citizens.nursingAreas.areaOverview.latestStatus') }}:</span>
                            {{ plainText(area.status.status) }}
                            <span class="text-gray-400">({{ formatDateToReadable(area.status.date) }})</span>
                        </p>

                        <div v-if="area.open_goals?.length" class="mt-2">
                            <p class="text-xs font-medium text-gray-900">
                                {{ $t('citizens.nursingAreas.areaOverview.openGoals') }} ({{ area.open_goals.length }})
                            </p>
                            <ul v-if="isExpanded(area.area)" class="mt-1 space-y-0.5">
                                <li v-for="goal in area.open_goals" :key="goal.uuid" class="text-xs text-gray-700">
                                    {{ goal.title }}<span v-if="goal.completion_date" class="text-gray-400"> · {{ formatDateToReadable(goal.completion_date) }}</span>
                                </li>
                            </ul>
                        </div>

                        <div v-if="area.open_treatments.length" class="mt-2">
                            <p class="text-xs font-medium text-primary">
                                {{ $t('citizens.nursingAreas.areaOverview.openTreatments', { count: area.open_treatments.length }, area.open_treatments.length) }}
                            </p>
                            <ul v-if="isExpanded(area.area)" class="mt-1 space-y-0.5">
                                <li v-for="treatment in area.open_treatments" :key="treatment.uuid" class="text-xs text-gray-700">
                                    {{ treatment.name }}<span v-if="treatment.completion_date" class="text-gray-400"> · {{ formatDateToReadable(treatment.completion_date) }}</span>
                                </li>
                            </ul>
                        </div>
                    </template>
                    <p v-else class="text-xs text-gray-400 mt-2">{{ $t('citizens.nursingAreas.areaOverview.empty') }}</p>

                    <!-- Plain-language guide: most staff are not health professionals. -->
                    <div v-if="isExpanded(area.area)" class="mt-3 rounded-md bg-primary/5 px-3 py-2 text-xs text-gray-700 space-y-1">
                        <p><span class="font-medium">{{ $t('citizens.nursingAreas.areaOverview.covers') }}:</span>
                            {{ $t(`citizens.nursingAreas.areaOverview.guide.${area.area}.covers`) }}</p>
                        <p><span class="font-medium">{{ $t('citizens.nursingAreas.areaOverview.watch') }}:</span>
                            {{ $t(`citizens.nursingAreas.areaOverview.guide.${area.area}.watch`) }}</p>
                        <p class="text-gray-500">{{ $t('citizens.nursingAreas.areaOverview.disclaimer') }}</p>
                    </div>
                    <p v-else class="text-xxs text-primary mt-2">{{ $t('citizens.nursingAreas.areaOverview.showGuide') }}</p>
                </button>
            </li>
        </ul>
    </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { nursingAreasService } from '@/components/api/user/NursingAreasService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { careAreaLabel } from '@/composables/careAreaOptions'

// The twelve health areas side by side, each showing what is going on in it,
// so seeing a citizen's nutrition no longer takes opening every record, its
// statuses and the treatment list in turn.
const props = defineProps<{ citizenUuid: string }>()

const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    isLoading: true,
    failed: false,
    onlyActive: false,
    areas: [] as any[],
    expanded: [] as string[],
})

const visibleAreas = computed(() => state.onlyActive ? state.areas.filter(hasContent) : state.areas)

function hasContent(area: any): boolean {
    return !!(area.assessment || area.status || area.open_treatments?.length || area.open_goals?.length)
}

function isExpanded(key: string): boolean {
    return state.expanded.includes(key)
}

function toggle(key: string) {
    state.expanded = isExpanded(key) ? state.expanded.filter((k) => k !== key) : [...state.expanded, key]
}

function plainText(html: string | null | undefined): string {
    if (!html) return ''
    return new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim() ?? ''
}

const PROBLEM_STATUS: Record<string, { label: string, class: string }> = {
    not_an_active_problem: { label: 'notAnActiveProblem', class: 'bg-green-100 text-green-700' },
    potential_problem: { label: 'potentialProblem', class: 'bg-amber-100 text-amber-700' },
    active_problem: { label: 'activeProblem', class: 'bg-red-100 text-red-700' },
}

function problemStatusLabel(value: string): string {
    const entry = PROBLEM_STATUS[value]
    return entry ? t(`citizens.nursingAreas.statuses.problemStatuses.${entry.label}`) : ''
}

function problemStatusClass(value: string): string {
    return PROBLEM_STATUS[value]?.class ?? 'bg-gray-100 text-gray-700'
}

onMounted(async () => {
    try {
        const response = await nursingAreasService.getCitizenAreaOverview({ citizen_uuid: props.citizenUuid })
        state.areas = response?.data ?? []
    } catch {
        state.failed = true
    }
    state.isLoading = false
})
</script>
