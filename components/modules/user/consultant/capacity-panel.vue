<template>
    <!-- Hours a week across the consultant's active indsatser: given, registered
         (average of the last four weeks, transport and administration
         included), wished and free. -->
    <div v-if="capacity" class="rounded-lg border border-gray-200 bg-white p-4">
        <p class="mb-1 text-sm font-semibold text-gray-900">{{ $t('consultantCapacity.title') }}</p>
        <p class="mb-4 text-xs text-gray-400">{{ basisHint }}</p>

        <dl class="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div v-for="tile in tiles" :key="tile.key" class="rounded-lg bg-surface-50 px-3 py-2.5">
                <dt class="text-xs text-gray-500">{{ $t('consultantCapacity.' + tile.key) }}</dt>
                <dd class="mt-0.5 text-lg font-semibold tabular-nums" :class="tile.class">
                    {{ tile.value === null ? '-' : `${hours(tile.value)} ${$t('consultantCapacity.perWeek')}` }}
                </dd>
            </div>
        </dl>

        <div v-if="capacity.cases?.length" class="mt-4 overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead>
                    <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                        <th class="py-2 pr-3 font-medium">{{ $t('consultantCapacity.case') }}</th>
                        <th class="py-2 pr-3 font-medium">{{ $t('consultantCapacity.allocated') }}</th>
                        <th class="py-2 pr-3 font-medium">{{ $t('consultantCapacity.granted') }}</th>
                        <th class="py-2 font-medium">{{ $t('consultantCapacity.registered') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="row in capacity.cases" :key="row.citizen_uuid">
                        <td class="py-2 pr-3">
                            <NuxtLink :to="`/citizens/${row.citizen_uuid}/contacts`" class="font-medium text-secondary hover:underline">
                                {{ [row.firstname, row.lastname].filter(Boolean).join(' ') }}
                            </NuxtLink>
                        </td>
                        <td class="py-2 pr-3 tabular-nums text-gray-800">
                            <template v-if="row.allocated_weekly_hours !== null">
                                {{ hours(row.allocated_weekly_hours) }} {{ $t('consultantCapacity.perWeek') }}
                                <span class="text-xs text-gray-500">
                                    · {{ $t('consultantCapacity.basis.' + row.allocation_basis, { count: row.consultants_on_case }) }}
                                </span>
                            </template>
                            <span v-else class="text-gray-500">{{ $t('consultantCapacity.basis.none') }}</span>
                        </td>
                        <td class="py-2 pr-3 tabular-nums text-gray-600">
                            {{ row.granted_weekly_hours !== null ? `${hours(row.granted_weekly_hours)} ${$t('consultantCapacity.perWeek')}` : '-' }}
                        </td>
                        <td class="py-2 tabular-nums text-gray-600">
                            {{ hours(row.registered_weekly_hours) }} {{ $t('consultantCapacity.perWeek') }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatWeekHours } from '@/composables/citizenWeeklyHours'

type CapacityCase = {
    citizen_uuid: string
    firstname: string | null
    lastname: string | null
    allocated_weekly_hours: number | null
    allocation_basis: 'explicit' | 'even_split' | 'none'
    consultants_on_case: number
    granted_weekly_hours: number | null
    registered_weekly_hours: number
}

type Capacity = {
    allocated_weekly_hours: number
    registered_weekly_hours: number
    desired_weekly_hours: number | null
    free_weekly_hours: number | null
    allocation_basis: 'explicit' | 'even_split' | 'mixed' | 'none'
    cases: CapacityCase[] | null
}

const props = defineProps<{ capacity: Capacity | null }>()

const { t, locale } = useI18n()

function hours(value: number) {
    return formatWeekHours(value, locale.value)
}

const tiles = computed(() => {
    const c = props.capacity
    if (!c) return []

    return [
        { key: 'allocated', value: c.allocated_weekly_hours, class: 'text-gray-900' },
        { key: 'registered', value: c.registered_weekly_hours, class: 'text-gray-900' },
        { key: 'desired', value: c.desired_weekly_hours, class: 'text-gray-900' },
        {
            key: 'free',
            value: c.free_weekly_hours,
            class: c.free_weekly_hours !== null && c.free_weekly_hours < 0 ? 'text-red-600' : 'text-gray-900',
        },
    ]
})

// Says where the given hours come from, since an even split is only an estimate.
const basisHint = computed(() => t('consultantCapacity.hints.' + (props.capacity?.allocation_basis ?? 'none')))
</script>
