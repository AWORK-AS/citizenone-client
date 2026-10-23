<template>
    <div v-if="problems.length" class="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-3"
        role="status">
        <Icon name="ph:heartbeat" class="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <template v-for="group in groups" :key="group.status">
            <span v-if="group.areas.length" class="text-xs font-medium text-gray-700">{{ group.label }}:</span>
            <span v-for="area in group.areas" :key="area"
                :class="group.class" class="inline-flex items-center rounded-full px-2 py-0.5 text-xxs font-medium">
                {{ careAreaLabel(area, t) }}
            </span>
        </template>
        <NuxtLink v-if="!onHealthPage" :to="`/citizens/${citizenUuid}/nursing-areas`"
            class="ml-auto text-xs font-medium text-primary hover:underline">
            {{ $t('citizens.nursingAreas.areaOverview.seeHealth') }}
        </NuxtLink>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { nursingAreasService } from '@/components/api/user/NursingAreasService'
import { careAreaLabel } from '@/composables/careAreaOptions'
import { usePermissions } from '@/composables/usePermissions'

// The health areas with an active or possible problem, above every citizen tab,
// so they are seen without opening Health first.
const props = defineProps<{ citizenUuid: string }>()

const { t } = useI18n()
const { can } = usePermissions()
const route = useRoute()

const onHealthPage = computed(() => String(route.name ?? '').startsWith('citizens-uuid-nursing-areas'))
const areas = ref<any[]>([])

const problems = computed(() => areas.value.filter((a) => ['active_problem', 'potential_problem'].includes(a.status?.problem_status)))

const groups = computed(() => [
    {
        status: 'active_problem',
        label: t('citizens.nursingAreas.areaOverview.activeProblems'),
        class: 'bg-red-100 text-red-700',
        areas: problems.value.filter((a) => a.status.problem_status === 'active_problem').map((a) => a.area),
    },
    {
        status: 'potential_problem',
        label: t('citizens.nursingAreas.areaOverview.potentialProblems'),
        class: 'bg-amber-100 text-amber-700',
        areas: problems.value.filter((a) => a.status.problem_status === 'potential_problem').map((a) => a.area),
    },
])

onMounted(async () => {
    if (!props.citizenUuid || !can('Health')) return
    try {
        const response = await nursingAreasService.getCitizenAreaOverview({ citizen_uuid: props.citizenUuid })
        areas.value = response?.data ?? []
    } catch {
        // A strip that cannot load is left out; the Health tab still works.
    }
})
</script>
