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

                <!-- Cody reads the same brief and says what it means. The list
                     below states the facts; this says how the day looks. -->
                <ModulesUserDailyOverviewCodyLine v-if="hasAi" :items="brief.items" />

                <!-- What needs attention on this shift. Every line is computed by
                     the API, not generated: the counters above say "medicine
                     today: 22" without saying which of the 22 is a problem. -->
                <section v-if="brief.items.length" aria-labelledby="daily-brief-heading"
                    class="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
                    <h2 id="daily-brief-heading" class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <Icon name="ph:bell-ringing" class="size-4 text-amber-600" aria-hidden="true" />
                        {{ $t('myDay.brief.heading') }}
                    </h2>
                    <ul class="space-y-2">
                        <li v-for="item in brief.items" :key="item.key"
                            class="flex items-stretch gap-1.5 rounded-lg bg-white ring-1 ring-gray-200 transition-colors hover:ring-primary/40">
                            <button type="button"
                                class="flex min-h-11 flex-1 items-start gap-3 rounded-l-lg px-3 py-2 text-left"
                                @click="navigateTo(item.link)">
                                <span class="mt-1 size-2 shrink-0 rounded-full" :class="{
                                    'bg-red-500': item.severity === 'critical',
                                    'bg-amber-500': item.severity === 'warning',
                                    'bg-slate-400': item.severity === 'info',
                                }" aria-hidden="true"></span>
                                <span class="min-w-0 flex-1">
                                    <span class="block text-sm font-medium text-gray-900">
                                        {{ $t(`myDay.brief.${item.key}`, item.count) }}
                                    </span>
                                    <span v-if="item.details?.length" class="mt-0.5 block truncate text-xs text-gray-500">
                                        {{ describe(item) }}
                                    </span>
                                </span>
                            </button>
                            <!-- The page already knows what this line says. Asking
                                 about it should not mean typing it out again. -->
                            <button v-if="hasAi" type="button"
                                class="flex shrink-0 items-center rounded-r-lg px-2.5 text-gray-400 transition-colors hover:bg-primary-25 hover:text-primary"
                                :aria-label="$t('myDay.brief.askCody', { subject: $t(`myDay.brief.${item.key}`, item.count) })"
                                :title="$t('myDay.brief.askCodyShort')"
                                @click="askCodyAbout(item)">
                                <ModulesUserNavbarCodyMark :size="17" />
                            </button>
                        </li>
                    </ul>
                </section>

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
                        <section v-if="hasMedicineModule" :id="`card-meds`" class="rounded-xl bg-white ring-1 ring-gray-200 p-5">
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

                        <!-- Who is carrying what, and what is on nobody. Read here
                             rather than by opening every case, which is how a team
                             works out who covers for somebody away. -->
                        <section v-if="distribution.coordinators.length" :id="`card-distribution`"
                            class="rounded-xl bg-white ring-1 ring-gray-200 p-5 lg:col-span-2">
                            <div class="flex items-center gap-2 mb-3">
                                <Icon name="ph:users-three" class="size-5 text-tertiary" />
                                <h3 class="font-semibold text-gray-900">{{ $t('myDay.distribution') }}</h3>
                                <NuxtLink v-if="distribution.unassigned" to="/citizens"
                                    class="ml-auto inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors">
                                    {{ $t('myDay.distributionUnassigned', { count: distribution.unassigned }) }}
                                </NuxtLink>
                            </div>
                            <ul class="space-y-2">
                                <li v-for="row in distribution.coordinators" :key="row.uuid"
                                    class="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
                                    <p class="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">{{ row.name }}</p>
                                    <span class="text-xs text-gray-500">
                                        {{ $t('myDay.distributionPrimary', { count: row.primary }) }}
                                    </span>
                                    <span v-if="row.secondary" class="text-xxs text-gray-400">
                                        {{ $t('myDay.distributionSecondary', { count: row.secondary }) }}
                                    </span>
                                </li>
                            </ul>
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
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/user'
import { useDepartmentStore } from '@/store/department'
import { myCalendarService } from '@/components/api/user/MyCalendarService'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { citizenContactService } from '@/components/api/user/CitizenContactService'
import { reminderService } from '@/components/api/user/ReminderService'
import { usePermissions } from '@/composables/usePermissions'
import { useAssistantStore, describeBriefItem, type BriefItem } from '@/store/assistant'

const runtimeConfig = useRuntimeConfig()
const { t, locale } = useI18n()

// Hardcoded rather than routed through moment's locale files: the app's
// bundler doesn't reliably pick up moment's side-effect-only
// `moment/locale/xx` imports (they silently fall back to English), and the
// exact wording per language ("den" in Danish, punctuation differences)
// doesn't map onto any single moment locale format anyway.
const weekdayNames: Record<string, string[]> = {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dk: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'],
    no: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'],
    sv: ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'],
}
const monthNames: Record<string, string[]> = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    dk: ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'],
    no: ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'],
    sv: ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'],
}
const userStore = useUserStore() as any
const assistantStore = useAssistantStore()
const departmentStore = useDepartmentStore() as any
const { isAtLeast, can } = usePermissions()

const breadcrumbLinks = [{ name: 'myDay.title', translate: true, href: '/my-day' }]
const today = moment().format('YYYY-MM-DD')

const state = reactive({
    isLoading: false,
    distribution: { coordinators: [] as any[], unassigned: 0 },
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

// Same two conditions as the /overview page's doses-due card: the page has to
// be granted, and the module has to be kept in the company's own module choices.
// A company that turned medicine off still saw this card since it wasn't gated.
const hasMedicineModule = computed(() => {
    const hasPage = userStore.getUser?.pages?.some((page: any) => page.name === 'Medicine card')
    return hasPage && userStore.getUser?.company?.onboarding_preferences?.modules?.medicin !== false
})

const firstName = computed(() => userStore.getUser?.firstname ?? '')

// moment's locale formats don't match the wording each language actually
// wants here: Danish inserts "den" before the day and da/nb/en all include a
// period after the day number, but Swedish doesn't - none of that matches a
// single `dddd D. MMMM YYYY` pattern, so the pieces are composed by hand.
// Weekday names are capitalized manually since da/nb/sv locales lowercase
// them by default (English already capitalizes on its own).
const todayLabel = computed(() => {
    const now = moment()
    const names = weekdayNames[locale.value] ?? weekdayNames.en
    const months = monthNames[locale.value] ?? monthNames.en
    const weekday = names[now.day()]
    const day = now.date()
    const month = months[now.month()]
    const year = now.year()

    switch (locale.value) {
        case 'dk': return `${weekday} den ${day}. ${month} ${year}`
        case 'sv': return `${weekday} ${day} ${month} ${year}`
        default: return `${weekday} ${day}. ${month} ${year}`
    }
})
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
    ...(hasMedicineModule.value ? [{ key: 'meds', icon: 'solar:jar-of-pills-2-linear', label: t('myDay.medsDue'), value: pendingMedsCount.value }] : []),
    { key: 'reminders', icon: 'ph:check-square', label: t('myDay.reminders'), value: state.reminders.filter((r) => !isReminderDone(r)).length },
])

// Shared with the Cody button and panel through the store, so the count in the
// topbar and the list on this page are the same fetch and cannot disagree.
const brief = reactive({ items: computed(() => assistantStore.brief) })
const describe = describeBriefItem

const hasAi = computed(() => !!userStore.getUser?.has_ai_access)

/**
 * Hand the line the reader is looking at straight to Cody.
 *
 * The question is built from what the page already renders, so the assistant is
 * asked about the same thing the reader can see rather than about a category.
 * The brief's own detail line carries initials and times and never full names -
 * it is written for a screen read in a shared room - so passing it along keeps
 * that property.
 */
function askCodyAbout(item: BriefItem) {
    const subject = t(`myDay.brief.${item.key}`, item.count)
    const detail = item.details?.length ? ` ${describe(item)}.` : ''

    assistantStore.askAbout(t('myDay.brief.askCodyPrompt', { subject, detail }))
}

// The brief is a summary of things visible elsewhere on the page, so a failure
// empties the card rather than breaking the day - the store is quiet on errors.
function fetchBrief() {
    assistantStore.loadBrief()
}

function scrollTo(key: string) {
    document.getElementById(`card-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

onMounted(() => {
    fetchAll()
    fetchBrief()
    fetchDistribution()
})

const distribution = computed(() => state.distribution)

/**
 * Its own request rather than part of fetchAll: it is the one card here that
 * is about the team rather than about today, and a company with no
 * coordinators simply never renders it.
 */
async function fetchDistribution() {
    try {
        const response = await citizenContactService.getCoordinatorDistribution()
        state.distribution = {
            coordinators: response?.data?.coordinators ?? [],
            unassigned: response?.data?.unassigned ?? 0,
        }
    } catch (_) {
        state.distribution = { coordinators: [], unassigned: 0 }
    }
}

async function fetchAll() {
    state.isLoading = true
    const dept = departmentStore.getSelectedDepartmentName
    const dateRange = { start_date: today, end_date: today }
    const results = await Promise.allSettled([
        myCalendarService.getCalendarShifts({ date: JSON.stringify(dateRange) }),
        dailyOverviewService.getMyDailyEvents(dateRange),
        // Nothing on the page reads it when the module is off: mirrors the
        // /overview page's fetchCitizensMedicines guard.
        hasMedicineModule.value
            ? dailyOverviewService.getCitizenDailyMedicineOverview({ department: dept, ...dateRange })
            : Promise.resolve(null),
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
