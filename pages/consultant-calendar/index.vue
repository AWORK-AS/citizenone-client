<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('consultantCalendar.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('consultantCalendar.title') }}</template>

            <p class="-mt-2 mb-5 text-sm text-gray-500">{{ $t('consultantCalendar.description') }}</p>

            <Alert type="danger" :text="state.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <!-- Who, which period, and booking -->
            <div class="mb-5 flex flex-wrap items-end gap-3">
                <div class="min-w-[16rem] flex-1">
                    <FormLabel for="consultants" :label="$t('consultantCalendar.consultants')" />
                    <FormSelectMultiple id="consultants" name="consultants" :options="state.consultantOptions"
                        :loading="state.isLoadingOptions" v-model="state.selected" />
                </div>
                <div class="flex items-center gap-x-1 rounded-lg bg-gray-100 p-1">
                    <button v-for="view in ['week', 'month']" :key="view" type="button"
                        class="rounded-md px-3 py-1.5 text-sm font-semibold transition"
                        :class="state.view === view ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'"
                        :aria-pressed="state.view === view" @click="setView(view)">
                        {{ $t(`consultantCalendar.views.${view}`) }}
                    </button>
                </div>
                <div class="flex items-center gap-x-1">
                    <button type="button" class="rounded-md p-2 text-gray-600 hover:bg-gray-100"
                        :aria-label="$t('consultantCalendar.previous')" @click="move(-1)">
                        <Icon name="ph:caret-left" class="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button type="button" class="rounded-md px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                        @click="goToday">
                        {{ $t('consultantCalendar.today') }}
                    </button>
                    <button type="button" class="rounded-md p-2 text-gray-600 hover:bg-gray-100"
                        :aria-label="$t('consultantCalendar.next')" @click="move(1)">
                        <Icon name="ph:caret-right" class="h-4 w-4" aria-hidden="true" />
                    </button>
                    <span class="ml-2 text-sm font-semibold text-gray-800">{{ periodLabel }}</span>
                </div>
                <FormButton buttonStyle="primary" @click="state.isBookOpen = true">
                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('consultantCalendar.book') }}
                </FormButton>
            </div>

            <div v-if="!state.selected.length"
                class="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
                {{ $t('consultantCalendar.pickConsultant') }}
            </div>

            <LoadingSpinner v-else :isActive="state.isLoading">
                <!-- Planned hours in the period. Staff meetings and supervision
                     on their own line, so they can be passed on to payroll. -->
                <div class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <div v-for="consultant in state.consultants" :key="consultant.uuid"
                        class="rounded-xl bg-white p-4 ring-1 ring-gray-200">
                        <p class="text-sm font-semibold text-gray-900">{{ consultant.name }}</p>
                        <dl class="mt-2 space-y-1 text-[13px]">
                            <div class="flex justify-between gap-x-3">
                                <dt class="text-gray-500">{{ $t('consultantCalendar.totals.planned') }}</dt>
                                <dd class="font-semibold tabular-nums text-gray-900">{{ hours(consultant.planned_minutes) }}</dd>
                            </div>
                            <div class="flex justify-between gap-x-3">
                                <dt class="text-gray-500">{{ $t('consultantCalendar.totals.citizens') }}</dt>
                                <dd class="tabular-nums text-gray-700">{{ hours(consultant.citizen_minutes) }}</dd>
                            </div>
                            <div class="flex justify-between gap-x-3">
                                <dt class="text-gray-500">{{ $t('consultantCalendar.totals.meetings') }}</dt>
                                <dd class="tabular-nums text-gray-700">{{ hours(consultant.meeting_minutes) }}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
                <p v-if="state.consultants.length > 1" class="mb-5 text-sm text-gray-700">
                    {{ $t('consultantCalendar.totals.all', {
                        planned: hours(state.totals.planned_minutes),
                        meetings: hours(state.totals.meeting_minutes),
                    }) }}
                </p>

                <ModulesUserCalendarTimeGrid v-if="state.view === 'week'" :days="weekDays" />

                <!-- Month: one cell a day, the first appointments and a count of the rest. -->
                <div v-else class="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm">
                    <div class="grid grid-cols-7 border-b border-gray-200">
                        <div v-for="day in weekdayNames" :key="day"
                            class="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            {{ $t(`calendar.week.short.${day}`) }}
                        </div>
                    </div>
                    <div class="grid grid-cols-7">
                        <div v-for="day in monthDays" :key="day.date"
                            class="min-h-[6.5rem] border-b border-l border-gray-100 p-1.5"
                            :class="!day.inMonth && 'bg-gray-50/70'">
                            <p class="mb-1 text-xs font-semibold"
                                :class="day.isToday ? 'text-primary' : day.inMonth ? 'text-gray-800' : 'text-gray-400'">
                                {{ day.dayNumber }}
                            </p>
                            <ul class="space-y-0.5">
                                <li v-for="(event, index) in day.events.slice(0, 3)" :key="index"
                                    class="truncate rounded px-1 py-0.5 text-[11px]"
                                    :class="event.is_busy ? 'bg-gray-100 text-gray-500' : 'bg-primary/10 text-primary'"
                                    :title="chipTitle(event)">
                                    <span class="tabular-nums">{{ time(event.date_time_start) }}</span>
                                    {{ chipTitle(event) }}
                                </li>
                                <li v-if="day.events.length > 3" class="px-1 text-[11px] text-gray-500">
                                    {{ $t('consultantCalendar.more', { count: day.events.length - 3 }) }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Every appointment in the period with its citizen and indsats. -->
                <div class="mt-6 rounded-xl bg-white ring-1 ring-gray-200">
                    <p class="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">
                        {{ $t('consultantCalendar.list') }}
                    </p>
                    <p v-if="!state.events.length" class="px-4 py-6 text-center text-sm text-gray-500">
                        {{ $t('consultantCalendar.empty') }}
                    </p>
                    <ul v-else class="divide-y divide-gray-100">
                        <li v-for="(event, index) in state.events" :key="index"
                            class="flex flex-wrap items-start gap-x-4 gap-y-1 px-4 py-2.5 text-[13px]"
                            :class="event.is_cancelled && 'opacity-60'">
                            <span class="w-40 shrink-0 tabular-nums text-gray-500">
                                {{ formatDateToReadable(event.date_time_start) }} {{ time(event.date_time_start) }}-{{ time(event.date_time_end) }}
                            </span>
                            <span class="w-40 shrink-0 text-gray-700">{{ consultantNames(event) }}</span>
                            <span class="min-w-0 flex-1">
                                <span class="font-semibold text-gray-900" :class="event.is_cancelled && 'line-through'">
                                    {{ event.is_busy ? $t('consultantCalendar.busy') : event.title }}
                                </span>
                                <span v-if="event.work_type"
                                    class="ml-2 rounded-full bg-gray-100 px-2 py-[1px] text-[11px] font-semibold text-gray-600">
                                    {{ $t(`consultantCalendar.workTypes.${event.work_type}`) }}
                                </span>
                                <span v-if="event.is_cancelled" class="ml-2 text-[11px] text-gray-500">
                                    {{ $t('consultantCalendar.cancelled') }}
                                </span>
                                <span v-for="citizen in event.citizens" :key="citizen.uuid" class="block text-gray-600">
                                    <NuxtLink :to="`/citizens/${citizen.uuid}/view-edit`" class="hover:underline">{{ citizen.name }}</NuxtLink>
                                    <span v-if="citizen.indsats" class="text-gray-500">, {{ citizen.indsats }}</span>
                                </span>
                            </span>
                        </li>
                    </ul>
                </div>
            </LoadingSpinner>

            <ModulesUserConsultantCalendarModalBook :isModalOpen="state.isBookOpen"
                :consultantOptions="bookableConsultants" :defaultConsultant="state.selected[0] ?? ''"
                @close="state.isBookOpen = false" @booked="fetchOverview" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { consultantCalendarService } from '@/components/api/user/ConsultantCalendarService'
import { userService } from '@/components/api/user/UserService'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

// Open to staff like the calendar itself; who may book whom is checked on the server.
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { t, locale } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()

const breadcrumbLinks = [
    { name: 'consultantCalendar.title', translate: true, href: '/consultant-calendar' },
]

const weekdayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const state = reactive({
    view: (route.query.view === 'month' ? 'month' : 'week') as string,
    anchor: moment().startOf('day'),
    selected: [] as string[],
    consultantOptions: [] as any[],
    isLoadingOptions: false,
    isLoading: false,
    isBookOpen: false,
    events: [] as any[],
    consultants: [] as any[],
    totals: { planned_minutes: 0, citizen_minutes: 0, meeting_minutes: 0 } as any,
    mayBookOthers: false,
    error: {} as any,
})

// ?consultant= from the search and the profile; several are comma separated.
const fromQuery = String(route.query.consultant ?? '').split(',').filter(Boolean)
state.selected = fromQuery.length ? fromQuery : (userStore.getUser?.uuid ? [userStore.getUser.uuid] : [])

const period = computed(() => {
    const start = state.view === 'week'
        ? state.anchor.clone().startOf('isoWeek')
        : state.anchor.clone().startOf('month')
    const end = state.view === 'week'
        ? start.clone().add(1, 'week')
        : start.clone().add(1, 'month')
    return { start, end }
})

const periodLabel = computed(() => {
    const { start, end } = period.value
    if (state.view === 'month') return `${t(`months.${start.clone().locale('en').format('MMMM').toLowerCase()}`)} ${start.format('YYYY')}`
    return `${t('consultantCalendar.week', { number: start.isoWeek() })}, ${start.format('D.M.')} - ${end.clone().subtract(1, 'day').format('D.M.YYYY')}`
})

function setView(view: string) {
    state.view = view
    router.replace({ query: { ...route.query, view } })
}

function move(step: number) {
    state.anchor = state.anchor.clone().add(step, state.view === 'week' ? 'week' : 'month')
}

function goToday() {
    state.anchor = moment().startOf('day')
}

function hours(minutes: number) {
    const value = (Number(minutes || 0) / 60).toLocaleString(locale.value === 'dk' ? 'da-DK' : locale.value, { maximumFractionDigits: 1 })
    return t('consultantCalendar.hours', { hours: value })
}

function time(value: string) {
    return moment(value).format('HH:mm')
}

function chipTitle(event: any) {
    if (event.is_busy) return t('consultantCalendar.busy')
    const names = (event.citizens ?? []).map((c: any) => c.name).join(', ')
    return names ? `${event.title}, ${names}` : event.title
}

function consultantNames(event: any) {
    return (event.consultant_uuids ?? [])
        .map((uuid: string) => state.consultants.find((c: any) => c.uuid === uuid)?.name)
        .filter(Boolean)
        .join(', ')
}

function eventsOn(date: moment.Moment) {
    const dayStart = date.clone().startOf('day')
    const dayEnd = dayStart.clone().add(1, 'day')
    return state.events.filter((e: any) => moment(e.date_time_start).isBefore(dayEnd) && moment(e.date_time_end).isAfter(dayStart))
}

// The time grid's day shape. A busy appointment is grey and says only "Optaget".
const weekDays = computed(() => Array.from({ length: 7 }, (_, i) => {
    const date = period.value.start.clone().add(i, 'day')
    return {
        date: date.format('YYYY-MM-DD'),
        fullDate: date.format('YYYY-MM-DD'),
        isToday: date.isSame(moment(), 'day'),
        weekdayLabel: t(`calendar.week.short.${weekdayNames[i]}`),
        dayNumber: date.date(),
        events: eventsOn(date).map((e: any, index: number) => ({
            ...e,
            uuid: e.uuid ?? `busy-${date.format('YYYYMMDD')}-${index}`,
            title: chipTitle(e),
            type: 'my_self',
            calendar_tags: e.is_busy ? [{ color: '#9CA3AF' }] : e.calendar_tags,
            completion_status: e.is_cancelled ? 'cancelled' : e.completion_status,
        })),
    }
}))

const monthDays = computed(() => {
    const first = period.value.start.clone().startOf('isoWeek')
    const last = period.value.end.clone().subtract(1, 'day').endOf('isoWeek')
    const days = []
    for (let date = first.clone(); date.isBefore(last); date.add(1, 'day')) {
        days.push({
            date: date.format('YYYY-MM-DD'),
            dayNumber: date.date(),
            inMonth: date.month() === period.value.start.month(),
            isToday: date.isSame(moment(), 'day'),
            events: eventsOn(date),
        })
    }
    return days
})

// Without "book consultants" the booking form offers only the user's own time.
const bookableConsultants = computed(() => state.mayBookOthers
    ? state.consultantOptions
    : state.consultantOptions.filter((o: any) => o.value === userStore.getUser?.uuid))

async function fetchConsultants() {
    state.isLoadingOptions = true
    try {
        const response = await userService.getAllUsersWithoutAllUsersOption()
        state.consultantOptions = (response.data ?? []).map((user: any) => ({
            value: user?.uuid,
            label: `${user?.firstname ?? ''} ${user?.lastname ?? ''}`.trim(),
        }))
    } catch (error: any) {
        state.error = error
    }
    state.isLoadingOptions = false
    keepSelectedInOptions()
}

// A consultant picked through the link, from the search or the profile, is
// shown in the picker even when the colleague list leaves them out or arrives
// after the selection: the multiselect only shows values it has options for.
function keepSelectedInOptions() {
    const known = new Set(state.consultantOptions.map((o: any) => o.value))
    for (const consultant of state.consultants) {
        if (!known.has(consultant.uuid)) {
            state.consultantOptions.push({ value: consultant.uuid, label: consultant.name })
        }
    }
    state.selected = [...state.selected]
}

async function fetchOverview() {
    if (!state.selected.length) {
        state.events = []
        state.consultants = []
        return
    }
    state.error = {}
    state.isLoading = true
    try {
        const response = await consultantCalendarService.getOverview({
            'consultant_uuids[]': state.selected,
            start: period.value.start.format('YYYY-MM-DD HH:mm:ss'),
            end: period.value.end.format('YYYY-MM-DD HH:mm:ss'),
        })
        state.events = response.data ?? []
        state.consultants = response.consultants ?? []
        if (state.selected.some((uuid: string) => !state.consultantOptions.some((o: any) => o.value === uuid))) keepSelectedInOptions()
        state.totals = response.totals ?? state.totals
        state.mayBookOthers = !!response.may_book_others
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

watch(() => [state.selected.join(','), state.view, period.value.start.valueOf()], fetchOverview)

onMounted(() => {
    fetchConsultants()
    fetchOverview()
})
</script>
