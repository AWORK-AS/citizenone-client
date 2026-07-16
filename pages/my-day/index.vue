<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('myDay.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('myDay.title') }}</template>

            <div class="space-y-6">
                <!-- Greeting -->
                <div class="rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-5 text-white shadow-sm">
                    <p class="text-lg font-semibold">{{ greeting }}, {{ firstName }} 👋</p>
                    <p class="text-sm text-white/80 mt-0.5">{{ todayLabel }}</p>
                </div>

                <!-- Stat row -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <button v-for="stat in stats" :key="stat.key" type="button" @click="scrollTo(stat.key)"
                        class="text-left rounded-xl bg-white ring-1 ring-gray-200 p-4 transition-all hover:ring-primary/40 hover:shadow-sm">
                        <div class="flex items-center gap-2 text-gray-500">
                            <Icon :name="stat.icon" class="size-4" aria-hidden="true" />
                            <span class="text-xxs font-medium uppercase tracking-wide">{{ stat.label }}</span>
                        </div>
                        <p class="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">{{ stat.value }}</p>
                    </button>
                </div>

                <LoadingSpinner :isActive="state.isLoading">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <!-- My shifts -->
                        <section :id="`card-shifts`" class="rounded-xl bg-white ring-1 ring-gray-200 p-5">
                            <div class="flex items-center gap-2 mb-3">
                                <Icon name="ph:clock" class="size-5 text-tertiary" />
                                <h3 class="font-semibold text-gray-900">{{ $t('myDay.shifts') }}</h3>
                            </div>
                            <ul v-if="state.shifts.length" class="space-y-2">
                                <li v-for="(s, i) in state.shifts" :key="i"
                                    class="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                                    <div class="min-w-0">
                                        <p class="text-sm font-medium text-gray-800 truncate">{{ s.title }}</p>
                                        <p class="text-xxs text-gray-500 truncate" v-if="s.citizens?.length">
                                            {{ s.citizens.map((c) => c.name).join(', ') }}
                                        </p>
                                    </div>
                                    <span class="shrink-0 text-xs font-medium text-gray-600 tabular-nums">
                                        {{ time(s.date_time_start) }}-{{ time(s.date_time_end) }}
                                    </span>
                                </li>
                            </ul>
                            <p v-else class="text-sm text-gray-400">{{ $t('myDay.noShifts') }}</p>
                        </section>

                        <!-- My events -->
                        <section :id="`card-events`" class="rounded-xl bg-white ring-1 ring-gray-200 p-5">
                            <div class="flex items-center gap-2 mb-3">
                                <Icon name="ph:calendar-blank" class="size-5 text-tertiary" />
                                <h3 class="font-semibold text-gray-900">{{ $t('myDay.events') }}</h3>
                            </div>
                            <ul v-if="state.events.length" class="space-y-2">
                                <li v-for="(e, i) in state.events" :key="i"
                                    class="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                                    <p class="text-sm font-medium text-gray-800 truncate min-w-0">{{ e.title }}</p>
                                    <span class="shrink-0 text-xs font-medium text-gray-600 tabular-nums">
                                        {{ time(e.date_time_start) }}-{{ time(e.date_time_end) }}
                                    </span>
                                </li>
                            </ul>
                            <p v-else class="text-sm text-gray-400">{{ $t('myDay.noEvents') }}</p>
                        </section>

                        <!-- Meds due -->
                        <section :id="`card-meds`" class="rounded-xl bg-white ring-1 ring-gray-200 p-5">
                            <div class="flex items-center gap-2 mb-3">
                                <Icon name="solar:jar-of-pills-2-linear" class="size-5 text-tertiary" />
                                <h3 class="font-semibold text-gray-900">{{ $t('myDay.medsDue') }}</h3>
                                <span class="ml-auto text-xxs text-gray-400">{{ $t('myDay.medsDeptNote') }}</span>
                            </div>
                            <ul v-if="pendingMeds.length" class="space-y-2">
                                <li v-for="(m, i) in pendingMeds" :key="i"
                                    class="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                                    <div class="min-w-0">
                                        <p class="text-sm font-medium text-gray-800 truncate">
                                            {{ (m.citizen?.firstname || '') + ' ' + (m.citizen?.lastname || '') }}
                                        </p>
                                        <p class="text-xxs text-gray-500 truncate">{{ medName(m) }}</p>
                                    </div>
                                    <span class="shrink-0 text-xxs font-medium text-white bg-secondary rounded-md px-2 py-1 tabular-nums">
                                        {{ m._nextPending }}
                                    </span>
                                </li>
                            </ul>
                            <p v-else class="text-sm text-gray-400">{{ $t('myDay.noMeds') }}</p>
                        </section>

                        <!-- Reminders -->
                        <section :id="`card-reminders`" class="rounded-xl bg-white ring-1 ring-gray-200 p-5 lg:col-span-2">
                            <div class="flex items-center gap-2 mb-3">
                                <Icon name="ph:check-square" class="size-5 text-tertiary" />
                                <h3 class="font-semibold text-gray-900">{{ $t('myDay.reminders') }}</h3>
                                <button type="button" @click="state.newTaskOpen = true"
                                    v-if="isAtLeast('Manager') || can('create')"
                                    class="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary-25 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-50 transition-colors">
                                    <Icon name="ph:plus" class="size-4" aria-hidden="true" />
                                    {{ $t('myDay.newTask') }}
                                </button>
                            </div>
                            <ul v-if="state.reminders.length" class="space-y-2">
                                <li v-for="r in state.reminders" :key="r.id"
                                    class="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
                                    <button type="button" @click="toggleReminder(r)" :disabled="state.togglingId === r.id"
                                        class="shrink-0 flex size-5 items-center justify-center rounded-md border border-gray-300 text-white transition-colors"
                                        :class="isReminderDone(r) ? 'bg-green-600 border-green-600' : 'hover:border-primary'">
                                        <Icon v-if="isReminderDone(r)" name="ph:check-bold" class="size-3.5" />
                                    </button>
                                    <div class="min-w-0 flex-1">
                                        <p class="text-sm font-medium text-gray-800 truncate"
                                            :class="isReminderDone(r) && 'line-through text-gray-400'">{{ r.title }}</p>
                                        <p class="text-xxs text-gray-500 truncate" v-if="r.notes">{{ r.notes }}</p>
                                    </div>
                                </li>
                            </ul>
                            <p v-else class="text-sm text-gray-400">{{ $t('myDay.noReminders') }}</p>
                        </section>
                    </div>
                </LoadingSpinner>

                <ModulesUserRemindersModalNew :isModalOpen="state.newTaskOpen"
                    @close="state.newTaskOpen = false" @refreshReminders="onTaskCreated" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/user'
import { useDepartmentStore } from '@/store/department'
import { myCalendarService } from '@/components/api/user/MyCalendarService'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { reminderService } from '@/components/api/user/ReminderService'
import { usePermissions } from '@/composables/usePermissions'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const userStore = useUserStore() as any
const departmentStore = useDepartmentStore() as any
const { isAtLeast, can } = usePermissions()

const breadcrumbLinks = [{ name: 'myDay.title', translate: true, href: '/my-day' }]
const today = moment().format('YYYY-MM-DD')

const state = reactive({
    isLoading: false,
    shifts: [] as any[],
    events: [] as any[],
    meds: [] as any[],
    reminders: [] as any[],
    togglingId: null as number | null,
    newTaskOpen: false,
})

function onTaskCreated() {
    state.newTaskOpen = false
    fetchAll()
}

const firstName = computed(() => userStore.getUser?.firstname ?? '')
const todayLabel = computed(() => moment().format('dddd D. MMMM YYYY'))
const greeting = computed(() => {
    const h = moment().hour()
    if (h < 10) return t('myDay.greeting.morning')
    if (h < 18) return t('myDay.greeting.day')
    return t('myDay.greeting.evening')
})

function time(v: any) {
    return v ? moment(v).format('HH:mm') : ''
}
function medName(m: any) {
    return m?.medicine?.en_name || m?.medicine?.dk_name || ''
}

// Meds with at least one still-pending (status null) due time today.
const pendingMeds = computed(() =>
    (state.meds || [])
        .map((m: any) => {
            const pending = (m?.due_dates || []).filter((d: any) => d?.status === null || d?.status === undefined)
            return pending.length ? { ...m, _nextPending: pending[0]?.time || '' } : null
        })
        .filter(Boolean)
)

function isReminderDone(r: any) {
    return !!r?.due_dates?.[0]?.is_complete
}

const stats = computed(() => [
    { key: 'shifts', icon: 'ph:clock', label: t('myDay.shifts'), value: state.shifts.length },
    { key: 'events', icon: 'ph:calendar-blank', label: t('myDay.events'), value: state.events.length },
    { key: 'meds', icon: 'solar:jar-of-pills-2-linear', label: t('myDay.medsDue'), value: pendingMeds.value.length },
    { key: 'reminders', icon: 'ph:check-square', label: t('myDay.reminders'), value: state.reminders.filter((r) => !isReminderDone(r)).length },
])

function scrollTo(key: string) {
    document.getElementById(`card-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

onMounted(() => fetchAll())

async function fetchAll() {
    state.isLoading = true
    const dept = departmentStore.getSelectedDepartmentName
    const dateRange = { start_date: today, end_date: today }
    const results = await Promise.allSettled([
        myCalendarService.getCalendarShifts({ date: JSON.stringify(dateRange) }),
        dailyOverviewService.getMyDailyEvents(dateRange),
        dailyOverviewService.getCitizenDailyMedicineOverview({ department: dept, ...dateRange }),
        reminderService.getReminders(),
    ])
    const [shifts, events, meds, reminders] = results.map((r: any) => (r.status === 'fulfilled' ? r.value : null))

    state.shifts = shifts?.data ?? []
    state.events = events?.data ?? []
    state.meds = Array.isArray(meds) ? meds : (meds?.data ?? [])
    // Only reminders with an occurrence today (fallback to first due date).
    state.reminders = (reminders?.data ?? []).filter((r: any) => {
        const dd = r?.due_dates ?? []
        return dd.some((d: any) => moment(d?.date).isSame(today, 'day')) || dd.length === 0
    })
    state.isLoading = false
}

async function toggleReminder(r: any) {
    if (isReminderDone(r)) return
    state.togglingId = r.id
    try {
        const dueDate = r?.due_dates?.[0]
        await reminderService.toggleReminderCompleteIncomplete({
            reminder_uuid: r.uuid,
            due_date_time: dueDate?.date || r.date_time,
        })
        const target = state.reminders.find((x: any) => x.id === r.id)
        if (target) {
            if (!target.due_dates?.[0]) target.due_dates = [{ is_complete: true }]
            else target.due_dates[0].is_complete = true
        }
    } catch (error) {
        // non-fatal
    }
    state.togglingId = null
}
</script>
