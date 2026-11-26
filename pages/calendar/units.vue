<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('units.overview.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('events.calendar') }}</template>

            <ModulesUserCalendarTabs />

            <!-- Roadmap #499: which car, room or piece of equipment is booked when, and which is free. -->
            <div class="mt-6 space-y-4">
                <div class="flex flex-wrap items-center gap-3">
                    <div class="inline-flex items-center gap-x-0.5 rounded-lg bg-gray-100 p-0.5">
                        <button v-for="opt in viewOptions" :key="opt.value" type="button" :data-testid="`units-view-${opt.value}`"
                            @click="setView(opt.value)" :class="[
                                state.view === opt.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800',
                                'rounded-md px-4 py-1.5 text-xs font-semibold transition',
                            ]">
                            {{ $t(opt.label) }}
                        </button>
                    </div>
                    <div class="inline-flex items-center rounded-full border border-gray-200 bg-white shadow-sm">
                        <button type="button" class="flex h-8 w-8 items-center justify-center rounded-l-full text-gray-500 hover:bg-gray-50"
                            :aria-label="$t('units.overview.previous')" @click="step(-1)">
                            <Icon name="heroicons:chevron-left" class="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span class="h-4 w-px bg-gray-200"></span>
                        <button type="button" class="flex h-8 w-8 items-center justify-center rounded-r-full text-gray-500 hover:bg-gray-50"
                            :aria-label="$t('units.overview.next')" @click="step(1)">
                            <Icon name="heroicons:chevron-right" class="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                    <button type="button" class="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50"
                        @click="goToday">{{ $t('calendar.today') }}</button>
                    <input type="date" v-model="state.date" data-testid="units-date"
                        class="rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-700" />
                    <span class="text-sm font-medium text-gray-700" data-testid="units-period">{{ periodLabel }}</span>
                </div>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div class="space-y-1">
                        <p class="text-sm text-gray-600">{{ $t('units.units') }}</p>
                        <FormSelectMultiple id="overview_units" :options="unitOptions" v-model="state.unitUuids"
                            :placeholder="$t('units.overview.allUnits')" />
                    </div>
                    <div class="space-y-1">
                        <label class="flex w-fit cursor-pointer items-center gap-x-2 text-sm text-gray-600">
                            <input type="checkbox" v-model="state.onlyFree" data-testid="units-only-free"
                                class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-0" />
                            {{ $t('units.overview.onlyFree') }}
                        </label>
                        <div v-if="state.onlyFree" class="flex flex-wrap items-center gap-2" data-testid="units-free-window">
                            <input type="date" v-model="state.freeDate" class="rounded-lg border border-gray-200 px-2 py-1 text-sm" />
                            <input type="time" v-model="state.freeFrom" :aria-label="$t('units.overview.freeFrom')" class="rounded-lg border border-gray-200 px-2 py-1 text-sm" />
                            <span class="text-gray-400">–</span>
                            <input type="time" v-model="state.freeTo" :aria-label="$t('units.overview.freeTo')" class="rounded-lg border border-gray-200 px-2 py-1 text-sm" />
                        </div>
                    </div>
                </div>

                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="!state.isLoading && state.allUnits.length === 0" class="rounded-xl border border-dashed border-gray-300 p-8 text-center" data-testid="units-empty">
                        <p class="font-medium text-gray-800">{{ $t('units.overview.noUnits') }}</p>
                        <p class="mt-1 text-sm text-gray-500">{{ $t('units.overview.noUnitsHint') }}</p>
                        <NuxtLink to="/settings/units" class="mt-3 inline-block text-sm font-medium text-primary hover:underline">
                            {{ $t('units.overview.goToSettings') }}
                        </NuxtLink>
                    </div>
                    <p v-else-if="!state.isLoading && state.rows.length === 0" class="text-sm text-gray-500" data-testid="units-none-free">
                        {{ $t('units.overview.noneFree') }}
                    </p>

                    <template v-else>
                        <!-- Desktop: rows of units, columns of days (or hours on a day). -->
                        <div class="hidden overflow-x-auto rounded-xl ring-1 ring-gray-200 md:block" data-testid="units-grid">
                            <!-- Day: an hour axis, bookings placed by their time. -->
                            <div v-if="state.view === 'day'" class="min-w-[56rem]">
                                <div class="flex border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500">
                                    <div class="w-48 flex-none px-3 py-2"></div>
                                    <div class="flex flex-1">
                                        <div v-for="hour in hours" :key="hour" class="flex-1 border-l border-gray-200 px-1 py-2">{{ String(hour).padStart(2, '0') }}</div>
                                    </div>
                                </div>
                                <div v-for="row in state.rows" :key="row.unit.uuid" class="flex border-b border-gray-100 last:border-b-0" data-testid="units-row">
                                    <div class="flex w-48 flex-none items-center gap-x-2 px-3 py-3 text-sm font-medium text-gray-800">
                                        <span class="h-2.5 w-2.5 flex-none rounded-full" :style="{ backgroundColor: colorOf(row.unit) }"></span>
                                        <span class="truncate">{{ row.unit.name }}</span>
                                    </div>
                                    <div class="relative flex flex-1 min-h-[3.25rem]">
                                        <button v-for="hour in hours" :key="hour" type="button" data-testid="units-free-cell"
                                            :data-unit="row.unit.uuid" :data-date="period.days[0]" :data-hour="hour"
                                            class="flex-1 border-l border-gray-100 hover:bg-primary/5"
                                            :aria-label="`${$t('units.overview.newEventHere')} ${row.unit.name} ${String(hour).padStart(2, '0')}:00`"
                                            @click="newEvent(row.unit, period.days[0], hour)"></button>
                                        <template v-for="(booking, index) in bookingsOnDay(row.bookings, period.days[0])" :key="index">
                                            <button v-if="placeInDay(booking, period.days[0])" type="button" data-testid="units-booking"
                                                :data-visible="booking.is_visible ? '1' : '0'" :title="tooltipOf(booking, period.days[0])"
                                                :aria-label="tooltipOf(booking, period.days[0])"
                                                class="absolute top-1.5 bottom-1.5 overflow-hidden rounded-md border-l-4 px-1.5 text-left text-xs"
                                                :style="{ ...chipStyle(row.unit), ...positionOf(booking, period.days[0]) }" @click.stop="openBooking(booking)">
                                                <span class="block truncate font-medium text-gray-800">{{ bookingLabel(booking, $t('units.overview.booked')) }}</span>
                                                <span class="block truncate text-gray-500">{{ timeLabel(booking, period.days[0]) }}</span>
                                            </button>
                                        </template>
                                    </div>
                                </div>
                            </div>

                            <!-- Week and month: a cell per day with its bookings. -->
                            <table v-else class="w-full table-fixed border-collapse text-sm" :class="state.view === 'month' ? 'min-w-[110rem]' : 'min-w-[56rem]'">
                                <thead>
                                    <tr class="bg-gray-50 text-xs font-medium text-gray-500">
                                        <th class="w-48 px-3 py-2 text-left"></th>
                                        <th v-for="day in period.days" :key="day" class="border-l border-gray-200 px-2 py-2 text-left"
                                            :class="isToday(day) ? 'text-tertiary' : ''">
                                            {{ dayLabel(day) }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="row in state.rows" :key="row.unit.uuid" class="border-t border-gray-100" data-testid="units-row">
                                        <td class="px-3 py-2 align-top">
                                            <div class="flex items-center gap-x-2 font-medium text-gray-800">
                                                <span class="h-2.5 w-2.5 flex-none rounded-full" :style="{ backgroundColor: colorOf(row.unit) }"></span>
                                                <span class="truncate">{{ row.unit.name }}</span>
                                            </div>
                                        </td>
                                        <td v-for="day in period.days" :key="day" class="group relative border-l border-gray-100 p-1 align-top">
                                            <div class="space-y-1">
                                                <button v-for="(booking, index) in bookingsOnDay(row.bookings, day)" :key="index" type="button"
                                                    data-testid="units-booking" :data-visible="booking.is_visible ? '1' : '0'"
                                                    :title="tooltipOf(booking, day)" :aria-label="tooltipOf(booking, day)"
                                                    class="block w-full overflow-hidden rounded-md border-l-4 px-1.5 py-1 text-left text-xs"
                                                    :style="chipStyle(row.unit)" @click="openBooking(booking)">
                                                    <span class="block truncate text-gray-500">{{ timeLabel(booking, day) }}</span>
                                                    <span class="block truncate font-medium text-gray-800">{{ bookingLabel(booking, $t('units.overview.booked')) }}</span>
                                                </button>
                                                <button type="button" data-testid="units-free-cell" :data-unit="row.unit.uuid" :data-date="day"
                                                    class="flex min-h-[1.75rem] w-full items-center justify-center rounded-md text-xs text-gray-300 hover:bg-primary/5 hover:text-primary"
                                                    :aria-label="`${$t('units.overview.newEventHere')} ${row.unit.name} ${dayLabel(day)}`"
                                                    @click="newEvent(row.unit, day)">
                                                    <Icon name="ph:plus" class="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Phone: a list per unit. -->
                        <div class="space-y-3 md:hidden" data-testid="units-list">
                            <div v-for="item in phoneRows" :key="item.unit.uuid" class="rounded-xl bg-white p-3 ring-1 ring-gray-200">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-x-2 font-medium text-gray-800">
                                        <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: colorOf(item.unit) }"></span>
                                        {{ item.unit.name }}
                                    </div>
                                    <button type="button" class="text-xs font-medium text-primary" @click="newEvent(item.unit, period.days[0])">
                                        {{ $t('units.overview.newEventHere') }}
                                    </button>
                                </div>
                                <p v-if="item.days.length === 0" class="mt-2 text-xs text-green-700">{{ $t('units.overview.free') }}</p>
                                <div v-for="day in item.days" :key="day.date" class="mt-2">
                                    <p class="text-xs font-medium text-gray-500">{{ dayLabel(day.date) }}</p>
                                    <button v-for="(booking, index) in day.bookings" :key="index" type="button"
                                        class="mt-1 w-full rounded-md border-l-4 px-2 py-1 text-left text-xs" :style="chipStyle(item.unit)"
                                        @click="openBooking(booking)">
                                        <span class="text-gray-500">{{ timeLabel(booking, day.date) }}</span>
                                        <span class="ml-1 font-medium text-gray-800">{{ bookingLabel(booking, $t('units.overview.booked')) }}</span>
                                        <span v-if="bookingDetails(booking)" class="block text-gray-500">{{ bookingDetails(booking) }}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </template>
                </LoadingSpinner>
            </div>

            <ModulesUserMyCalendarMyselfModalNew :isModalOpen="state.modal.isNewOpen"
                :presetStart="state.newEvent.start" :presetUnitUuid="state.newEvent.unitUuid"
                @close="state.modal.isNewOpen = false" @refreshSchedules="fetchBookings" />
            <ModulesUserCitizenCalendarModalView v-if="state.selectedSchedule" :isModalOpen="state.modal.isViewOpen"
                :selectedSchedule="state.selectedSchedule" @close="state.modal.isViewOpen = false"
                @refreshSchedules="fetchBookings" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { unitService } from '@/components/api/user/UnitService'
import { myCalendarService } from '@/components/api/user/MyCalendarService'
import {
    periodFor, shiftDate, bookingsOnDay, placeInDay, hourSlots, timeLabel, bookingLabel, bookingDetails,
    phoneList, freeWindow, newEventStart,
} from '@/composables/unitOverview'
import type { OverviewView, UnitBooking, UnitRow } from '@/composables/unitOverview'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const runtimeConfig = useRuntimeConfig()

const breadcrumbLinks = [
    { name: 'events.calendar', translate: true, href: '/calendar' },
    { name: 'units.overview.title', translate: true, href: '/calendar/units' },
]

const viewOptions = [
    { value: 'day', label: 'calendar.view.day' },
    { value: 'week', label: 'calendar.view.week' },
    { value: 'month', label: 'calendar.view.month' },
] as const

const today = moment().format('YYYY-MM-DD')

const state = reactive({
    view: 'week' as OverviewView,
    date: today,
    unitUuids: [] as string[],
    onlyFree: false,
    freeDate: today,
    freeFrom: '10:00',
    freeTo: '12:00',
    allUnits: [] as any[],
    rows: [] as UnitRow[],
    isLoading: false,
    error: {} as any,
    selectedSchedule: null as any,
    newEvent: { start: '', unitUuid: '' },
    modal: { isNewOpen: false, isViewOpen: false },
})

const period = computed(() => periodFor(state.view, state.date || today))
const hours = hourSlots()
const phoneRows = computed(() => phoneList(state.rows, period.value.days))
const unitOptions = computed(() => state.allUnits.map((unit: any) => ({ value: unit.uuid, label: unit.name })))

const periodLabel = computed(() => {
    const { from, to } = period.value
    const fmt = (d: string, f: string) => moment(d).locale(momentLocale()).format(f)
    if (state.view === 'day') return fmt(from, 'dddd D. MMMM YYYY')
    if (state.view === 'month') return fmt(from, 'MMMM YYYY')
    return `${t('calendar.weekNumber', { week: moment(from).isoWeek() })} · ${fmt(from, 'D. MMM')} – ${fmt(to, 'D. MMM YYYY')}`
})

function momentLocale() {
    return ({ dk: 'da', no: 'nb', sv: 'sv', en: 'en' } as any)[locale.value] ?? 'en'
}

function dayLabel(day: string) {
    const f = state.view === 'month' ? 'dd D' : 'ddd D/M'
    return moment(day).locale(momentLocale()).format(f)
}

function isToday(day: string) {
    return day === today
}

function colorOf(unit: { color: string | null }) {
    return unit.color || '#94A3B8'
}

function chipStyle(unit: { color: string | null }) {
    const color = colorOf(unit)
    return { borderLeftColor: color, backgroundColor: `${color}1A` }
}

function positionOf(booking: UnitBooking, day: string) {
    const place = placeInDay(booking, day)
    return place ? { left: `${place.left}%`, width: `${place.width}%` } : {}
}

function tooltipOf(booking: UnitBooking, day: string) {
    const details = bookingDetails(booking)
    return details ? `${timeLabel(booking, day)} · ${details}` : `${timeLabel(booking, day)} · ${t('units.overview.booked')}`
}

function setView(view: OverviewView) {
    state.view = view
}

function step(direction: number) {
    state.date = shiftDate(state.view, state.date || today, direction)
}

function goToday() {
    state.date = today
}

async function fetchUnits() {
    try {
        const response = await unitService.getAllUnits()
        state.allUnits = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
}

async function fetchBookings() {
    state.error = {}
    state.isLoading = true
    try {
        const params: Record<string, string> = { from: period.value.from, to: period.value.to }
        if (state.unitUuids.length) params.unit_uuids = JSON.stringify(state.unitUuids)
        const window = state.onlyFree ? freeWindow(state.freeDate, state.freeFrom, state.freeTo) : null
        if (window) Object.assign(params, window)
        const response = await unitService.getUnitBookings(params)
        state.rows = response?.data ?? []
    } catch (error: any) {
        state.error = error
        state.rows = []
    }
    state.isLoading = false
}

// A free spot: a new event with the unit and time already filled in.
function newEvent(unit: { uuid: string }, day: string, hour?: number) {
    state.newEvent = { start: newEventStart(day, hour), unitUuid: unit.uuid }
    state.modal.isNewOpen = true
}

// A booking opens the event, as in the calendar; one the viewer may not see opens nothing.
async function openBooking(booking: UnitBooking) {
    if (!booking.is_visible || !booking.calendar_uuid) return
    try {
        const response = await myCalendarService.getSchedule(booking.calendar_uuid)
        state.selectedSchedule = response?.data ?? null
        state.modal.isViewOpen = !!state.selectedSchedule
    } catch (error: any) {
        state.error = error
    }
}

watch(() => [period.value.from, period.value.to, state.unitUuids.join(','), state.onlyFree, state.freeDate, state.freeFrom, state.freeTo], fetchBookings)

onMounted(async () => {
    await fetchUnits()
    await fetchBookings()
})
</script>
