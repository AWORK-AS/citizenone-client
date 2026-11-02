<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('meetings.stats.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('meetings.title') }}</template>

            <NuxtLink to="/meetings" class="inline-flex items-center gap-1.5 mb-4 text-sm text-gray-500 hover:text-[#0f2b46]">
                <Icon name="ph:arrow-left" class="h-4 w-4" /> {{ $t('meetings.title') }}
            </NuxtLink>

            <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div>
                    <h2 class="text-2xl font-semibold text-[#0f2b46]">{{ $t('meetings.stats.title') }}</h2>
                    <p class="text-sm text-gray-500">{{ $t('meetings.stats.subtitle') }}</p>
                </div>
                <div class="inline-flex rounded-full bg-white ring-1 ring-gray-200 p-1">
                    <button v-for="option in periods" :key="option.days" type="button"
                        class="px-3.5 py-1.5 text-sm rounded-full transition"
                        :class="state.days === option.days ? 'bg-[#0f4c75] text-white' : 'text-gray-600 hover:bg-gray-50'"
                        @click="choose(option.days)">
                        {{ option.label }}
                    </button>
                </div>
            </div>

            <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

            <LoadingSpinner :isActive="state.isLoading">
                <div v-if="stats" class="space-y-6">
                    <!-- Saved by meeting online: the headline. -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div v-for="tile in savedTiles" :key="tile.key" class="rounded-2xl bg-[#0f2b46] text-white p-5">
                            <p class="text-sm text-white/70 flex items-center gap-2">
                                <Icon :name="tile.icon" class="h-4 w-4" /> {{ tile.label }}
                            </p>
                            <p class="mt-2 text-3xl font-semibold tabular-nums">{{ tile.value }}</p>
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 -mt-3">
                        {{ $t('meetings.stats.assumption', { km: stats.saved.assumed_km_per_meeting, minutes: stats.saved.assumed_minutes_per_meeting }) }}
                        <template v-if="stats.saved.hourly_rate !== undefined">{{ $t('meetings.stats.rateAssumption', { rate: number(stats.saved.hourly_rate) }) }}</template>
                    </p>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <!-- Host seats: what is paid for, and who is not using theirs. -->
                        <div v-if="stats.seats" class="rounded-2xl bg-white ring-1 ring-gray-900/5 shadow-sm p-5">
                            <p class="text-sm font-semibold text-[#0f2b46] flex items-center gap-2">
                                <Icon name="ph:identification-badge" class="h-4 w-4" /> {{ $t('meetings.stats.seatsTitle') }}
                            </p>
                            <p class="mt-2 text-2xl font-semibold text-[#0f2b46] tabular-nums">
                                {{ $t('meetings.stats.seatsActive', { active: stats.seats.active_hosts, assigned: stats.seats.assigned }) }}
                            </p>
                            <div class="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
                                <div class="h-full bg-[#2dbab2]" :style="{ width: `${seatShare}%` }" />
                            </div>
                            <p class="mt-2 text-xs text-gray-500">
                                {{ $t('meetings.stats.seatsBought', { bought: stats.seats.bought, free: Math.max(0, stats.seats.bought - stats.seats.assigned) }) }}
                            </p>
                            <div v-if="stats.seats.idle_hosts.length" class="mt-3 text-sm">
                                <p class="text-gray-600">{{ $t('meetings.stats.seatsIdle') }}</p>
                                <!-- Who may move seats can hand an unused one to a colleague here. -->
                                <ul v-if="canMoveSeats" class="mt-1 divide-y divide-gray-100">
                                    <li v-for="host in stats.seats.idle_hosts" :key="host.uuid" class="py-1.5">
                                        <div class="flex items-center justify-between gap-2">
                                            <span class="text-gray-900">{{ host.name }}</span>
                                            <button v-if="move.from !== host.uuid" type="button" class="text-primary hover:underline text-xs"
                                                @click="startMove(host.uuid)">{{ $t('meetings.stats.moveSeat') }}</button>
                                        </div>
                                        <div v-if="move.from === host.uuid" class="mt-2 flex flex-wrap items-center gap-2">
                                            <select v-model="move.to" :aria-label="$t('meetings.stats.moveSeatTo')"
                                                class="flex-1 min-w-40 rounded-md border-gray-300 text-sm py-1">
                                                <option value="" disabled>{{ $t('meetings.stats.moveSeatTo') }}</option>
                                                <option v-for="person in stats.seats.without_seat" :key="person.uuid" :value="person.uuid">{{ person.name }}</option>
                                            </select>
                                            <FormButton type="button" buttonStyle="primary" :disabled="!move.to || move.busy" @click="moveSeat">
                                                {{ $t('meetings.stats.moveSeatConfirm') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="cancel" @click="move.from = ''">{{ $t('meetings.stats.cancel') }}</FormButton>
                                        </div>
                                    </li>
                                </ul>
                                <p v-else class="text-gray-900">{{ stats.seats.idle_hosts.map((h: any) => h.name).join(', ') }}</p>
                                <p v-if="move.done" class="mt-2 text-xs text-green-700">{{ move.done }}</p>
                            </div>
                        </div>

                        <!-- From meeting to journal. Older API versions do not send it. -->
                        <div v-if="stats.journal" class="rounded-2xl bg-white ring-1 ring-gray-900/5 shadow-sm p-5">
                            <p class="text-sm font-semibold text-[#0f2b46] flex items-center gap-2">
                                <Icon name="ph:notebook" class="h-4 w-4" /> {{ $t('meetings.stats.journalTitle') }}
                            </p>
                            <template v-if="stats.journal.meetings_about_citizen">
                                <p class="mt-2 text-2xl font-semibold text-[#0f2b46] tabular-nums">{{ stats.journal.share }}%</p>
                                <div class="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
                                    <div class="h-full bg-[#2dbab2]" :style="{ width: `${stats.journal.share}%` }" />
                                </div>
                                <p class="mt-2 text-xs text-gray-500">
                                    {{ $t('meetings.stats.journalDetail', { done: stats.journal.to_journal, total: stats.journal.meetings_about_citizen }) }}
                                </p>
                            </template>
                            <p v-else class="mt-2 text-sm text-gray-500">{{ $t('meetings.stats.journalNone') }}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div v-for="tile in countTiles" :key="tile.key" class="rounded-2xl bg-white ring-1 ring-gray-900/5 shadow-sm p-5">
                            <p class="text-sm text-gray-500">{{ tile.label }}</p>
                            <p class="mt-1 text-2xl font-semibold text-[#0f2b46] tabular-nums">{{ tile.value }}</p>
                        </div>
                    </div>

                    <div v-if="stats.by_month.length > 1" class="rounded-2xl bg-white ring-1 ring-gray-900/5 shadow-sm p-5">
                        <p class="text-sm font-semibold text-[#0f2b46] mb-4">{{ $t('meetings.stats.perMonth') }}</p>
                        <div class="flex gap-3 h-48">
                            <div v-for="row in stats.by_month" :key="row.month" class="flex-1 h-full flex flex-col items-center gap-2 min-w-0">
                                <!-- The bar's height is a share of this box, so the box needs one of its own. -->
                                <div class="flex-1 w-full flex flex-col items-center justify-end gap-1.5">
                                    <span class="text-xs text-gray-600 tabular-nums">{{ row.meetings }}</span>
                                    <div class="w-full max-w-14 rounded-t-md bg-[#2dbab2]" :style="{ height: `${Math.max(4, (row.meetings / maxMonth) * 85)}%` }" />
                                </div>
                                <span class="text-[11px] text-gray-500 truncate capitalize">{{ monthLabel(row.month) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-application', requiredApplication: 'meetings_enabled' })

import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { meetingService } from '@/components/api/user/MeetingService'
import { employeeService } from '@/components/api/user/EmployeeService'

/**
 * What online meetings did for the company: meetings held, time in
 * meetings, guests reached, and the driving saved by not meeting in person
 * (from the company's own estimate per meeting, set under settings).
 * Managers and administrators only; the API checks.
 */
const runtimeConfig = useRuntimeConfig()
const { t, locale } = useI18n()

const state = reactive({ days: 30, data: null as any, isLoading: false, error: {} as any })
const stats = computed(() => state.data)

const periods = computed(() => [
    { days: 30, label: t('meetings.stats.days', { days: 30 }) },
    { days: 90, label: t('meetings.stats.days', { days: 90 }) },
    { days: 365, label: t('meetings.stats.year') },
])

const number = (value: number) => new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK').format(value)

const savedTiles = computed(() => stats.value ? [
    ...(stats.value.saved.kroner !== undefined
        ? [{ key: 'kroner', icon: 'ph:coins', label: t('meetings.stats.kronerSaved'), value: `${number(stats.value.saved.kroner)} kr.` }]
        : []),
    { key: 'km', icon: 'ph:car', label: t('meetings.stats.kmSaved'), value: `${number(stats.value.saved.km)} km` },
    { key: 'time', icon: 'ph:clock-countdown', label: t('meetings.stats.timeSaved'), value: hours(stats.value.saved.travel_minutes) },
    { key: 'co2', icon: 'ph:leaf', label: t('meetings.stats.co2Saved'), value: `${number(stats.value.saved.co2_kg)} kg` },
] : [])

const countTiles = computed(() => stats.value ? [
    { key: 'held', label: t('meetings.stats.held'), value: number(stats.value.meetings_held) },
    { key: 'minutes', label: t('meetings.stats.inMeetings'), value: hours(stats.value.minutes) },
    { key: 'guests', label: t('meetings.stats.withGuests'), value: number(stats.value.meetings_with_guests) },
    { key: 'summaries', label: t('meetings.stats.summaries'), value: `${number(stats.value.summaries)} / ${number(stats.value.recordings)}` },
] : [])

const seatShare = computed(() => {
    const seats = stats.value?.seats
    return seats?.assigned ? Math.round((seats.active_hosts / seats.assigned) * 100) : 0
})

// Move an idle host's seat to a colleague without one. Older API versions
// send neither can_manage nor without_seat, and the names stay plain text.
const canMoveSeats = computed(() => !!stats.value?.seats?.can_manage && (stats.value?.seats?.without_seat?.length ?? 0) > 0)
const move = reactive({ from: '', to: '', busy: false, done: '' })

function startMove(uuid: string) {
    move.from = uuid
    move.to = ''
    move.done = ''
}

async function moveSeat() {
    const from = stats.value?.seats?.idle_hosts.find((h: any) => h.uuid === move.from)
    const to = stats.value?.seats?.without_seat.find((p: any) => p.uuid === move.to)
    if (!from || !to) return
    move.busy = true
    state.error = {}
    try {
        await employeeService.moveMeetingsLicense(from.uuid, to.uuid)
        move.from = ''
        await load()
        move.done = t('meetings.stats.moveSeatDone', { from: from.name, to: to.name })
    } catch (error: any) {
        state.error = error
    }
    move.busy = false
}

const maxMonth = computed(() => Math.max(1, ...(stats.value?.by_month ?? []).map((row: any) => row.meetings)))

function hours(minutes: number) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (!h) return t('meetings.stats.minutes', { m })
    return m ? t('meetings.stats.hoursMinutes', { h: number(h), m }) : t('meetings.stats.hours', { h: number(h) })
}

// "okt. 26" in the user's language (moment has no Danish locale loaded here).
function monthLabel(month: string) {
    const tag = { dk: 'da-DK', no: 'nb-NO', sv: 'sv-SE', en: 'en-GB' }[locale.value as string] ?? 'da-DK'
    return new Intl.DateTimeFormat(tag, { month: 'short', year: '2-digit' }).format(new Date(`${month}-01T12:00:00`))
}

async function load() {
    state.isLoading = true
    state.error = {}
    try {
        const response = await meetingService.statistics({
            from: moment().subtract(state.days - 1, 'days').format('YYYY-MM-DD'),
            to: moment().format('YYYY-MM-DD'),
        })
        state.data = response?.data ?? null
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function choose(days: number) {
    state.days = days
    load()
}

onMounted(load)
</script>
