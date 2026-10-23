<template>
    <!-- Hours brought across from the previous system. History only: they are
         never invoiced or paid again, so they are shown here and nowhere else.
         Hidden when the citizen has none. -->
    <div v-if="state.months.length > 0" class="rounded-lg border border-gray-200 bg-white">
        <button type="button"
            class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-900"
            :aria-expanded="state.isOpen" @click="state.isOpen = !state.isOpen">
            <span>
                {{ $t('socialWelfare.contract.migratedHours.title') }}
                <span class="ml-2 font-normal text-gray-500">{{ formatHours(totalHours) }} {{ $t('socialWelfare.contract.migratedHours.hoursShort') }}</span>
            </span>
            <Icon :name="state.isOpen ? 'ph:caret-up' : 'ph:caret-down'" class="size-4 text-gray-500" />
        </button>
        <div v-if="state.isOpen" class="border-t border-gray-100 p-4">
            <p class="mb-3 max-w-3xl text-xs text-gray-500">{{ $t('socialWelfare.contract.migratedHours.description') }}</p>
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead>
                        <tr class="text-left text-xs text-gray-500">
                            <th class="py-2 pr-4 font-medium">{{ $t('socialWelfare.contract.migratedHours.month') }}</th>
                            <th v-for="type in TYPES" :key="type" class="py-2 pr-4 text-right font-medium">
                                {{ $t(`socialWelfare.contract.migratedHours.types.${type}`) }}
                            </th>
                            <th class="py-2 pr-4 text-right font-medium">{{ $t('socialWelfare.contract.migratedHours.kilometers') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in rows" :key="row.month" class="border-t border-gray-100">
                            <td class="py-2 pr-4 text-gray-700">{{ row.month }}</td>
                            <td v-for="type in TYPES" :key="type" class="py-2 pr-4 text-right tabular-nums text-gray-700">
                                {{ row.hours[type] ? formatHours(row.hours[type]) : '-' }}
                            </td>
                            <td class="py-2 pr-4 text-right tabular-nums text-gray-700">{{ row.kilometers ? formatHours(row.kilometers) : '-' }}</td>
                        </tr>
                        <tr class="border-t border-gray-200 font-semibold text-gray-900">
                            <td class="py-2 pr-4">{{ $t('socialWelfare.contract.migratedHours.total') }}</td>
                            <td v-for="type in TYPES" :key="type" class="py-2 pr-4 text-right tabular-nums">
                                {{ state.totals[type] ? formatHours(state.totals[type]) : '-' }}
                            </td>
                            <td class="py-2 pr-4" />
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { interventionHoursService } from '@/components/api/user/InterventionHoursService'

const props = defineProps({
    citizenUuid: {
        type: String,
        required: true,
    },
})

const TYPES = ['contact', 'admin', 'transport', 'other'] as const

const state = reactive({
    isOpen: false,
    months: [] as any[],
    totals: {} as Record<string, number>,
})

// One row per month, the hour types side by side, newest first.
const rows = computed(() => {
    const byMonth: Record<string, { month: string, hours: Record<string, number>, kilometers: number }> = {}
    for (const entry of state.months) {
        const row = byMonth[entry.month] ??= { month: entry.month, hours: {}, kilometers: 0 }
        row.hours[entry.hour_type] = (row.hours[entry.hour_type] ?? 0) + Number(entry.hours)
        row.kilometers += Number(entry.kilometers) || 0
    }

    return Object.values(byMonth).sort((a, b) => b.month.localeCompare(a.month))
})

const totalHours = computed(() => Object.values(state.totals).reduce((sum, hours) => sum + Number(hours), 0))

function formatHours(value: number): string {
    return Number(value).toLocaleString('da-DK', { maximumFractionDigits: 2 })
}

async function fetchHistory() {
    try {
        const response = await interventionHoursService.getHistory(props.citizenUuid)
        state.months = response?.data?.months ?? []
        state.totals = response?.data?.totals ?? {}
    } catch {
        // Not an admin, or nothing to show: the panel simply stays hidden.
        state.months = []
    }
}

onMounted(fetchHistory)
</script>
