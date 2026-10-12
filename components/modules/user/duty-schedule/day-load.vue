<template>
    <!--
        Task #6: the load of one day - who is on duty against the departments'
        minimum staffing ("Minimumsbemanding"). Red under the minimum, green at
        or above it, neutral when no minimum is set. Counted over every employee,
        not just the rows on screen.
    -->
    <component :is="props.compact ? 'div' : Tooltip" v-if="props.load" v-bind="wrapperProps" class="w-full">
        <div :class="[
            'flex w-full flex-col items-center justify-center rounded-md font-medium tabular-nums leading-tight',
            props.compact ? 'px-1 py-0.5 text-[10px]' : 'px-1 py-1 text-xs',
            status === 'under' && 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-300',
            status === 'met' && 'bg-green-50 text-green-800 ring-1 ring-inset ring-green-200',
            status === 'none' && 'bg-gray-50 text-gray-600',
        ]" :aria-label="summary" :title="props.compact ? summary : undefined">
            <!-- Two short lines so it fits a narrow day column without breaking a number. -->
            <span class="inline-flex items-center gap-0.5 whitespace-nowrap">
                <Icon :name="status === 'under' ? 'ph:warning-fill' : 'ph:users'" class="size-3.5 shrink-0" aria-hidden="true" />
                {{ props.load.staff_count }}<template v-if="hasMinimum">/{{ props.load.minimum_staff }}</template>
            </span>
            <span class="whitespace-nowrap text-[0.85em] opacity-75">
                {{ $t('dutySchedules.dayLoad.hoursShort', { hours: formatHours(props.load.planned_hours, numberLocale) }) }}
            </span>
        </div>
    </component>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { dutyDayLoad, type DayLoad } from '@/composables/dutyDayLoad'
import Tooltip from '@/components/tooltip/index.vue'

const props = defineProps({
    load: {
        type: Object as PropType<DayLoad | null>,
        default: null,
    },
    /** Open (unfilled) shifts that day, shown in the tooltip. */
    openSlots: {
        type: Number,
        default: 0,
    },
    /** Small, without the tooltip - for the month grid's day header. */
    compact: {
        type: Boolean,
        default: false,
    },
})

const { t, locale } = useI18n()
const { loadStatus, missingStaff, formatHours } = dutyDayLoad()

const status = computed(() => loadStatus(props.load))
const hasMinimum = computed(() => status.value !== 'none')
const numberLocale = computed(() => (locale.value === 'en' ? 'en-GB' : locale.value === 'sv' ? 'sv-SE' : locale.value === 'no' ? 'nb-NO' : 'da-DK'))

const summary = computed(() => {
    const load = props.load
    if (!load) return ''
    const lines = [
        t('dutySchedules.dayLoad.onDuty', { count: load.staff_count }),
        t('dutySchedules.dayLoad.plannedHours', { hours: formatHours(load.planned_hours, numberLocale.value) }),
        t('dutySchedules.dayLoad.shifts', { count: load.shift_count }),
        t('dutySchedules.dayLoad.absent', { count: load.absent_count }),
        t('dutySchedules.dayLoad.openSlots', { count: props.openSlots }),
    ]
    if (hasMinimum.value) {
        lines.push(t('dutySchedules.dayLoad.minimum', { count: load.minimum_staff }))
    }
    if (status.value === 'under') {
        lines.push(t('dutySchedules.dayLoad.missing', { count: missingStaff(load) }))
    }
    return lines.join(' · ')
})

const wrapperProps = computed(() => (props.compact ? {} : { text: summary.value, wrap: true, position: 'bottom' }))
</script>
