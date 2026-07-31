<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('myDay.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                <OverviewTabs active="my-day" />
            </template>

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
                                <NuxtLink v-if="showDutyScheduleLink" to="/schedules"
                                    class="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                                    {{ $t('sidebar.dutySchedules') }}
                                    <Icon name="ph:arrow-right" class="size-3.5" aria-hidden="true" />
                                </NuxtLink>
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
                                <NuxtLink v-if="showCalendarLink" to="/calendar"
                                    class="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                                    {{ $t('sidebar.calendar') }}
                                    <Icon name="ph:arrow-right" class="size-3.5" aria-hidden="true" />
                                </NuxtLink>
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
                            <ul v-if="medicineRows.length" class="space-y-2">
                                <li v-for="(row, i) in medicineRows" :key="i">
                                    <button v-if="row.status === null" type="button" @click="openGiveMedicine(row.medicine, row.time)"
                                        class="w-full flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-left transition-colors hover:bg-primary-25">
                                        <div class="min-w-0">
                                            <p class="text-sm font-medium text-gray-800 truncate">
                                                {{ (row.medicine.citizen?.firstname || '') + ' ' + (row.medicine.citizen?.lastname || '') }}
                                            </p>
                                            <p class="text-xxs text-gray-500 truncate">{{ medName(row.medicine) }}</p>
                                        </div>
                                        <Tooltip :text="statusLabel(row.status)">
                                            <span class="shrink-0 text-xxs font-medium text-white bg-secondary rounded-md px-2 py-1 tabular-nums">
                                                {{ row.time }}
                                            </span>
                                        </Tooltip>
                                    </button>
                                    <div v-else class="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                                        <div class="min-w-0">
                                            <p class="text-sm font-medium text-gray-800 truncate">
                                                {{ (row.medicine.citizen?.firstname || '') + ' ' + (row.medicine.citizen?.lastname || '') }}
                                            </p>
                                            <p class="text-xxs text-gray-500 truncate">{{ medName(row.medicine) }}</p>
                                        </div>
                                        <Tooltip :text="statusLabel(row.status)">
                                            <span :class="[
                                                row.status === 'delivered' && 'bg-primary',
                                                row.status === 'deviated' && 'bg-red-600',
                                                row.status === 'given' && 'bg-green-700',
                                                'shrink-0 text-xxs font-medium text-white rounded-md px-2 py-1 tabular-nums'
                                            ]">
                                                {{ row.time }}
                                            </span>
                                        </Tooltip>
                                    </div>
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
                            <ul v-if="activeReminders.length" class="space-y-2">
                                <li v-for="r in activeReminders" :key="r.id" @click="openViewReminder(r)"
                                    class="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 cursor-pointer transition-colors hover:bg-primary-25">
                                    <button type="button" @click.stop="toggleReminder(r)" :disabled="state.togglingId === r.id"
                                        class="shrink-0 flex size-5 items-center justify-center rounded-md border border-gray-300 text-white transition-colors hover:border-primary">
                                    </button>
                                    <div class="min-w-0 flex-1">
                                        <p class="text-sm font-medium text-gray-800 truncate">{{ r.title }}</p>
                                        <p class="text-xxs text-gray-500 truncate" v-if="r.notes">{{ notesPreview(r.notes) }}</p>
                                    </div>
                                </li>
                            </ul>
                            <p v-else-if="!completedReminders.length" class="text-sm text-gray-400">{{ $t('myDay.noReminders') }}</p>

                            <div v-if="completedReminders.length" class="mt-2 -mx-5 -mb-5 rounded-b-xl overflow-hidden">
                                <button type="button" @click="state.showCompletedReminders = !state.showCompletedReminders"
                                    class="w-full flex items-center gap-2 px-5 py-2.5 bg-gray-50 border-t border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                                    <Icon :name="state.showCompletedReminders ? 'ph:caret-down' : 'ph:caret-right'" class="size-3.5" />
                                    {{ $t('reminders.table.completed') }} ({{ completedReminders.length }})
                                </button>
                                <template v-if="state.showCompletedReminders">
                                    <div v-for="r in completedReminders" :key="r.id" @click="openViewReminder(r)"
                                        class="flex items-center gap-3 px-5 py-2 border-t border-gray-100 bg-gray-50/60 cursor-pointer transition-colors hover:bg-gray-100">
                                        <span class="shrink-0 flex size-5 items-center justify-center rounded-md border border-green-600 bg-green-600 text-white">
                                            <Icon name="ph:check-bold" class="size-3.5" />
                                        </span>
                                        <div class="min-w-0 flex-1">
                                            <p class="text-sm font-medium text-gray-400 truncate line-through">{{ r.title }}</p>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </section>
                    </div>
                </LoadingSpinner>

                <ModulesUserRemindersModalNew :isModalOpen="state.newTaskOpen"
                    @close="state.newTaskOpen = false" @refreshReminders="onTaskCreated" />
                <ModulesUserRemindersModalView :isModalOpen="state.viewReminderOpen"
                    :selectedReminder="state.selectedReminder" @close="state.viewReminderOpen = false"
                    @refreshReminders="fetchAll" />
                <ModulesUserCitizenMedicineModalGiveMedicine :isModalOpen="state.giveMedicineOpen"
                    :selectedMedicine="state.selectedMedicine" :preselectedDate="today"
                    :preselectedTime="state.selectedMedicine?._nextPending ?? undefined"
                    @close="state.giveMedicineOpen = false" @refreshMedicines="onMedicineGiven" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import 'moment/locale/da'
import 'moment/locale/nb'
import 'moment/locale/sv'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/user'
import { useDepartmentStore } from '@/store/department'
import { myCalendarService } from '@/components/api/user/MyCalendarService'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { reminderService } from '@/components/api/user/ReminderService'
import { usePermissions } from '@/composables/usePermissions'

const runtimeConfig = useRuntimeConfig()
const { t, locale } = useI18n()

// vue-i18n locales are 'en'/'dk'/'no'/'sv'; moment's locale keys differ for
// Danish and Norwegian ('da' and 'nb'), so they can't be used interchangeably.
const momentLocales: Record<string, string> = { en: 'en', dk: 'da', no: 'nb', sv: 'sv' }
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
    showCompletedReminders: false,
    viewReminderOpen: false,
    selectedReminder: {} as any,
    giveMedicineOpen: false,
    selectedMedicine: {} as any,
})

function onTaskCreated() {
    state.newTaskOpen = false
    fetchAll()
}

// Company-level module enablement: no list (empty) = every module on (default).
// Mirrors the same check layouts/user.vue uses to decide whether to show these
// nav items at all, so the shortcut links here never point somewhere the
// user's company doesn't have access to.
function hasModule(name: string) {
    const modules = userStore.getUser?.company?.module_pages
    return !Array.isArray(modules) || modules.length === 0 || modules.includes(name)
}
const showCalendarLink = computed(() => hasModule('Calendar'))
const showDutyScheduleLink = computed(() => {
    const vagtplanEnabled = userStore.getUser?.company?.onboarding_preferences?.modules?.vagtplan !== false
    return hasModule('Duty Schedule') && vagtplanEnabled &&
        !!userStore.getUser?.pages?.some((p: any) => p.name === 'Duty Schedule')
})

const firstName = computed(() => userStore.getUser?.firstname ?? '')
const todayLabel = computed(() => moment().locale(momentLocales[locale.value] ?? 'en').format('dddd D. MMMM YYYY'))
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

// One row per due-date occurrence today (not just still-pending ones), so the
// widget can show the Given/Deviated/Delivered color scheme instead of
// collapsing every medicine down to its next pending time.
const medicineRows = computed(() => {
    const rows: any[] = []
    for (const m of state.meds || []) {
        for (const d of m?.due_dates || []) {
            rows.push({ medicine: m, status: d?.status ?? null, time: d?.time || '' })
        }
    }
    return rows
})

const pendingMedsCount = computed(() => medicineRows.value.filter((r) => r.status === null).length)

function statusLabel(status: string | null) {
    switch (status) {
        case 'delivered': return t('overview.medicationOverview.delivered')
        case 'deviated': return t('overview.medicationOverview.deviated')
        case 'given': return t('overview.medicationOverview.given')
        default: return t('overview.medicationOverview.notManaged')
    }
}

// due_dates holds every occurrence of a recurring reminder, not just today's -
// [0] is the earliest one ever created, so a reminder completed months ago
// would otherwise read as "done" today even though today's occurrence isn't.
function todayDueDate(r: any) {
    const dd = r?.due_dates ?? []
    return dd.find((d: any) => moment(d?.date).isSame(today, 'day')) ?? dd[0]
}

function isReminderDone(r: any) {
    return !!todayDueDate(r)?.is_complete
}

const activeReminders = computed(() => state.reminders.filter((r: any) => !isReminderDone(r)))
const completedReminders = computed(() => state.reminders.filter((r: any) => isReminderDone(r)))

// Notes are CKEditor-authored HTML; strip tags for the compact list preview
// (the view modal renders the full rich content safely on its own).
function notesPreview(html: string) {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function openViewReminder(r: any) {
    state.selectedReminder = r
    state.viewReminderOpen = true
}

function openGiveMedicine(m: any, time: string) {
    // findOverview() returns raw dosage column names (name_dk/name_en); the
    // give-medicine modal expects dk_name/en_name like elsewhere in the app.
    state.selectedMedicine = {
        ...m,
        _nextPending: time,
        dosage: m.dosage ? {
            ...m.dosage,
            dk_name: m.dosage.dk_name ?? m.dosage.name_dk,
            en_name: m.dosage.en_name ?? m.dosage.name_en,
        } : m.dosage,
    }
    state.giveMedicineOpen = true
}

function onMedicineGiven() {
    state.giveMedicineOpen = false
    fetchAll()
}

const stats = computed(() => [
    { key: 'shifts', icon: 'ph:clock', label: t('myDay.shifts'), value: state.shifts.length },
    { key: 'events', icon: 'ph:calendar-blank', label: t('myDay.events'), value: state.events.length },
    { key: 'meds', icon: 'solar:jar-of-pills-2-linear', label: t('myDay.medsDue'), value: pendingMedsCount.value },
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
        const dueDate = todayDueDate(r)
        await reminderService.toggleReminderCompleteIncomplete({
            reminder_uuid: r.uuid,
            due_date_time: dueDate?.date || r.date_time,
        })
        const target = state.reminders.find((x: any) => x.id === r.id)
        const targetDue = target && todayDueDate(target)
        if (target && targetDue) targetDue.is_complete = true
        else if (target) target.due_dates = [{ date: dueDate?.date || r.date_time, is_complete: true }]
    } catch (error) {
        // non-fatal
    }
    state.togglingId = null
}
</script>
