<template>
    <div class="card" data-testid="next-shift-widget">
        <div class="card-header">
            <div class="flex items-center gap-x-2">
                <Icon name="ph:clock-countdown" class="h-5 w-5 text-primary" />
                <h3 class="text-sm font-semibold text-slate-900">
                    {{ $t('overview.nextShift.title') }}
                </h3>
            </div>
        </div>

        <LoadingSpinner :isActive="state.isPageLoading">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <p v-if="!state.isPageLoading && !shift && !state.error?.message"
                class="px-5 py-6 text-sm text-slate-500" data-testid="next-shift-empty">
                {{ $t('overview.nextShift.none') }}
            </p>

            <button v-if="shift" type="button" data-testid="next-shift-open"
                class="block w-full px-5 py-4 text-left hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                :title="$t('overview.nextShift.clickForDetails')" @click="state.isDetailsOpen = true">
                <div class="flex items-start justify-between gap-x-3">
                    <div>
                        <p class="text-xs font-medium uppercase tracking-wide text-slate-500"
                            data-testid="next-shift-day">
                            {{ dayLabel }}
                        </p>
                        <p class="mt-1 text-2xl font-semibold text-slate-900" data-testid="next-shift-time">
                            {{ timeRange }}
                        </p>
                    </div>
                    <span v-if="countdownLabel" class="badge badge-blue whitespace-nowrap"
                        data-testid="next-shift-countdown">
                        {{ countdownLabel }}
                    </span>
                </div>

                <div class="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                    <span v-if="shift.shift_name" class="inline-flex items-center gap-x-1.5">
                        <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: shift.shift_color || '#94a3b8' }" />
                        {{ shift.shift_name }}
                    </span>
                    <span class="inline-flex items-center gap-x-1" data-testid="next-shift-department">
                        <Icon name="ph:map-pin" class="h-4 w-4 text-slate-400" />
                        {{ departmentNames || $t('overview.nextShift.noDepartment') }}
                    </span>
                </div>

                <p v-if="shift.is_different_department" class="mt-3 badge badge-orange whitespace-normal"
                    data-testid="next-shift-different-department">
                    <Icon name="ph:arrows-left-right" class="mr-1 h-3.5 w-3.5 shrink-0" />
                    {{ $t('overview.nextShift.differentDepartment') }}<template v-if="usualNames">
                        · {{ $t('overview.nextShift.usually', { department: usualNames }) }}</template>
                </p>
            </button>
        </LoadingSpinner>

        <Modal size="sm" :title="$t('overview.nextShift.details')" :show="state.isDetailsOpen"
            @close="state.isDetailsOpen = false">
            <template #modal-body>
                <dl v-if="shift" class="space-y-3 text-sm" data-testid="next-shift-details">
                    <div class="flex justify-between gap-x-4">
                        <dt class="text-slate-500">{{ $t('overview.nextShift.shift') }}</dt>
                        <dd class="font-medium text-slate-900">{{ shift.shift_name || '-' }}</dd>
                    </div>
                    <div class="flex justify-between gap-x-4">
                        <dt class="text-slate-500">{{ $t('overview.nextShift.date') }}</dt>
                        <dd class="font-medium text-slate-900">{{ fullDate }}</dd>
                    </div>
                    <div class="flex justify-between gap-x-4">
                        <dt class="text-slate-500">{{ $t('overview.nextShift.time') }}</dt>
                        <dd class="font-medium text-slate-900">{{ timeRange }}</dd>
                    </div>
                    <div class="flex justify-between gap-x-4">
                        <dt class="text-slate-500">{{ $t('overview.nextShift.duration') }}</dt>
                        <dd class="font-medium text-slate-900">{{ durationLabel }}</dd>
                    </div>
                    <div class="flex justify-between gap-x-4">
                        <dt class="text-slate-500">
                            {{ shift.departments?.length > 1 ? $t('overview.nextShift.departments') : $t('overview.nextShift.department') }}
                        </dt>
                        <dd class="text-right font-medium text-slate-900">
                            {{ departmentNames || $t('overview.nextShift.noDepartment') }}
                        </dd>
                    </div>
                    <p v-if="shift.is_different_department" class="badge badge-orange whitespace-normal">
                        {{ $t('overview.nextShift.onlyDifferent') }}
                        <template v-if="usualNames">{{ $t('overview.nextShift.usually', { department: usualNames }) }}</template>
                    </p>
                    <p class="text-xs text-slate-500">{{ $t('overview.nextShift.reminderInfo') }}</p>
                </dl>
                <div class="mt-5 flex gap-x-3 justify-end">
                    <FormButton buttonStyle="secondary" @click="goToSchedule">
                        {{ $t('overview.nextShift.viewSchedule') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="state.isDetailsOpen = false">
                        {{ $t('close') }}
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import type { Error } from '@/types'

const { t } = useI18n()
const { formatDateWithWeekdayToReadable } = useDatetimeFormatter()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isDetailsOpen: false,
    nextShift: null as any,
    fetchedAt: Date.now(),
    now: Date.now(),
})

let timer: ReturnType<typeof setInterval> | null = null

const shift = computed(() => state.nextShift)

/** Minutes left, counted down from when the server answered so a stale clock on this device cannot skew it. */
const minutesUntilStart = computed(() => {
    if (!shift.value) return null
    const elapsed = Math.floor((state.now - state.fetchedAt) / 60000)
    return Math.max(0, shift.value.minutes_until_start - elapsed)
})

const start = computed(() => moment(shift.value?.date_time_start))
const end = computed(() => moment(shift.value?.date_time_end))

const timeRange = computed(() => `${start.value.format('HH:mm')} - ${end.value.format('HH:mm')}`)

const fullDate = computed(() => formatDateWithWeekdayToReadable(shift.value?.date_time_start))

/** Today / Tomorrow, otherwise the weekday and date. */
const dayLabel = computed(() => {
    const day = moment(shift.value?.date)
    if (day.isSame(moment(), 'day')) return t('overview.nextShift.today')
    if (day.isSame(moment().add(1, 'day'), 'day')) return t('overview.nextShift.tomorrow')
    return fullDate.value
})

/** Only worth showing when the shift is close; further out the date says it all. */
const countdownLabel = computed(() => {
    const minutes = minutesUntilStart.value
    if (minutes === null || minutes >= 24 * 60) return ''
    if (minutes === 0) return t('overview.nextShift.startingNow')
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    const time = hours === 0
        ? t('overview.nextShift.minutesOnly', { minutes: rest })
        : t('overview.nextShift.hoursMinutes', { hours, minutes: rest })
    return t('overview.nextShift.startsIn', { time })
})

const durationLabel = computed(() => {
    const minutes = end.value.diff(start.value, 'minutes')
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return rest === 0
        ? t('overview.nextShift.hoursShort', { hours })
        : t('overview.nextShift.hoursMinutes', { hours, minutes: rest })
})

const departmentNames = computed(() => (shift.value?.departments ?? []).map((d: any) => d.name).join(', '))
const usualNames = computed(() => (shift.value?.usual_departments ?? []).map((d: any) => d.name).join(', '))

watch(minutesUntilStart, (minutes, previous) => {
    // The shift has started: look for the one after it.
    if (minutes === 0 && previous !== null && previous > 0) {
        setTimeout(fetchNextShift, 60000)
    }
})

onMounted(() => {
    fetchNextShift()
    timer = setInterval(() => { state.now = Date.now() }, 30000)
})

onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
})

async function fetchNextShift() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await dailyOverviewService.getNextShift()
        state.nextShift = response?.data ?? null
        state.fetchedAt = Date.now()
        state.now = state.fetchedAt
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function goToSchedule() {
    state.isDetailsOpen = false
    navigateTo('/schedules')
}
</script>
