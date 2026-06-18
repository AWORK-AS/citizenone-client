<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>Discover - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb
                    :links="[{ name: 'overview.overview', href: '/overview', translate: true }, { name: 'Discover', href: '/discover' }]" />
            </template>

            <template #header>
                <div class="flex items-center gap-x-6">
                    <span
                        class="text-primary border-b-2 border-primary pb-1 font-semibold cursor-default">Discover</span>
                    <span class="text-slate-400 hover:text-slate-600 cursor-pointer" @click="navigateTo('/overview')">{{
                        $t('overview.overview') }}</span>
                </div>
            </template>

            <!-- Welcome -->
            <div
                class="mt-4 rounded-2xl bg-gradient-to-br from-primary to-[#1b6d8a] text-white p-6 md:p-8 relative overflow-hidden">
                <div class="relative z-10 flex items-center justify-between gap-x-6">
                    <div class="max-w-2xl">
                        <h1 class="text-2xl md:text-3xl font-bold">{{ $t('discover.welcome', { name: firstName }) }} 👋
                        </h1>
                        <p v-if="!allDone" class="mt-2 text-white/80">{{ $t('discover.subtitle') }}</p>
                        <p v-else class="mt-2 text-white/90 font-medium">🎉 {{ $t('discover.ready.title') }} — {{
                            $t('discover.ready.desc') }}</p>
                        <div class="mt-4 flex items-center gap-x-3">
                            <button type="button" @click="state.modal.whatDoYouNeed = true"
                                class="inline-flex items-center gap-x-2 rounded-lg bg-white/15 hover:bg-white/25 px-3.5 py-2 text-sm font-medium transition-colors">
                                <Icon name="ph:sliders-horizontal" class="h-4 w-4" />
                                {{ $t('discover.whatDoYouNeed') }}
                            </button>
                            <span class="text-sm text-white/70">{{ $t('discover.stepsProgress', {
                                done: totalDone,
                                total: totalSteps
                            }) }}</span>
                        </div>
                    </div>
                    <!-- Overall progress ring -->
                    <div class="hidden md:flex shrink-0 relative h-24 w-24 items-center justify-center">
                        <svg viewBox="0 0 36 36" class="h-24 w-24 -rotate-90">
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.2)"
                                stroke-width="3" />
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="white" stroke-width="3"
                                stroke-linecap="round" :stroke-dasharray="`${progressPct} 100`"
                                class="transition-all duration-500" />
                        </svg>
                        <span class="absolute text-xl font-bold">{{ progressPct }}%</span>
                    </div>
                </div>
                <Icon name="ph:compass" class="absolute -right-6 -bottom-8 h-48 w-48 text-white/10" />
            </div>

            <!-- Next step -->
            <div v-if="!allDone && nextStep"
                class="mt-6 rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 flex items-center justify-between gap-x-4">
                <div class="flex items-center gap-x-4 min-w-0">
                    <div
                        class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary shrink-0">
                        <Icon :name="nextStep.group.icon" class="h-6 w-6" />
                    </div>
                    <div class="min-w-0">
                        <p class="text-xs font-semibold uppercase tracking-wide text-primary">{{ $t('discover.nextStep')
                            }}</p>
                        <p class="font-semibold text-slate-900 truncate">{{
                            $t(`discover.steps.${nextStep.step.key}.title`) }}</p>
                        <p class="text-sm text-slate-500 truncate">{{ $t(`discover.steps.${nextStep.step.key}.desc`) }}
                        </p>
                    </div>
                </div>
                <button type="button" @click="runStep(nextStep.step)"
                    class="shrink-0 inline-flex items-center gap-x-1.5 rounded-lg bg-primary text-white px-4 py-2.5 text-sm font-medium hover:bg-[#0d3f61] transition-colors">
                    {{ $t(`discover.steps.${nextStep.step.key}.cta`) }}
                    <Icon name="ph:arrow-right" class="h-4 w-4" />
                </button>
            </div>

            <!-- Step groups -->
            <div class="mt-6 space-y-4">
                <div v-for="group in visibleGroups" :key="group.key" class="card !p-0 overflow-hidden">
                    <button type="button" @click="toggle(group.key)"
                        class="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                        <div class="flex items-center gap-x-3">
                            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Icon :name="group.icon" class="h-5 w-5" />
                            </div>
                            <div class="text-left">
                                <h3 class="font-semibold text-slate-900">{{ $t(`discover.groups.${group.key}`) }}</h3>
                                <p class="text-xs text-slate-500">{{ $t('discover.groupProgress', {
                                    done:
                                        groupDone(group), total:
                                        group.steps.length
                                }) }}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-x-4">
                            <div class="hidden sm:block w-40 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div class="h-full bg-primary transition-all"
                                    :style="{ width: `${group.steps.length ? (groupDone(group) / group.steps.length) * 100 : 0}%` }" />
                            </div>
                            <Icon :name="isOpen(group.key) ? 'ph:caret-up' : 'ph:caret-down'"
                                class="h-5 w-5 text-slate-400" />
                        </div>
                    </button>

                    <div v-show="isOpen(group.key)" class="px-5 pb-5 pt-1 divide-y divide-slate-100">
                        <div v-for="(step, i) in group.steps" :key="step.key"
                            class="flex items-start gap-x-4 py-4 first:pt-2">
                            <Icon
                                :name="stepDone(step) ? 'ph:check-circle-fill' : (stepLocked(group, i) ? 'ph:lock-simple' : 'ph:circle')"
                                class="mt-0.5 h-6 w-6 shrink-0"
                                :class="stepDone(step) ? 'text-emerald-500' : 'text-slate-300'" />
                            <div class="min-w-0 flex-1">
                                <p class="font-medium"
                                    :class="stepDone(step) ? 'text-slate-400 line-through' : 'text-slate-900'">{{
                                        $t(`discover.steps.${step.key}.title`) }}</p>
                                <p class="text-sm text-slate-500 mt-0.5">{{ $t(`discover.steps.${step.key}.desc`) }}</p>
                                <div v-if="step.tip"
                                    class="mt-2 flex items-start gap-x-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                                    <Icon name="ph:lightbulb" class="h-4 w-4 shrink-0 text-amber-400" />
                                    <span>{{ $t(`discover.steps.${step.key}.tip`) }}</span>
                                </div>
                                <div class="mt-3" v-if="!stepDone(step)">
                                    <button type="button" v-if="!stepLocked(group, i)"
                                        @click="step.action ? runStepAction(step.action) : navigateTo(step.route)"
                                        class="inline-flex items-center gap-x-1.5 rounded-lg bg-primary text-white px-3.5 py-2 text-sm font-medium hover:bg-[#0d3f61] transition-colors">
                                        {{ $t(`discover.steps.${step.key}.cta`) }}
                                        <Icon name="ph:arrow-right" class="h-4 w-4" />
                                    </button>
                                    <span v-else class="inline-flex items-center gap-x-1.5 text-xs text-slate-400">
                                        <Icon name="ph:lock-simple" class="h-3.5 w-3.5" />
                                        {{ $t('discover.lockedHint') }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Promo: mobile app -->
                <div
                    class="rounded-2xl bg-slate-800 text-white p-6 flex items-center justify-between gap-x-4 overflow-hidden relative">
                    <div class="relative z-10">
                        <h3 class="text-lg font-semibold">{{ $t('discover.promoTitle') }}</h3>
                        <p class="mt-1 text-white/70 text-sm">{{ $t('discover.promoDesc') }}</p>
                        <button type="button" @click="state.modal.appInfo = true"
                            class="mt-3 rounded-lg bg-white text-slate-800 px-3.5 py-2 text-sm font-medium hover:bg-white/90 transition-colors">
                            {{ $t('discover.promoCta') }}
                        </button>
                    </div>
                    <Icon name="ph:device-mobile" class="h-20 w-20 text-white/20 shrink-0" />
                </div>
            </div>

            <!-- "What do you need?" modal -->
            <Modal size="sm" :title="$t('discover.whatDoYouNeed')" :show="state.modal.whatDoYouNeed"
                @close="state.modal.whatDoYouNeed = false">
                <template #modal-body>
                    <p class="text-sm text-slate-600">{{ $t('discover.modalIntro') }}</p>
                    <div class="mt-4 space-y-1">
                        <div v-for="mod in moduleOptions" :key="mod.key"
                            class="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 hover:bg-slate-50 cursor-pointer"
                            @click="modules[mod.key] = !modules[mod.key]">
                            <div class="flex items-center gap-x-2.5">
                                <Icon :name="mod.icon" class="h-5 w-5 text-primary" />
                                <span class="text-sm text-slate-800">{{ $t(`discover.modules.${mod.key}`) }}</span>
                            </div>
                            <FormSwitch :value="modules[mod.key]"
                                @toggleSwitch="modules[mod.key] = !modules[mod.key]" />
                        </div>
                    </div>
                    <div class="mt-6 flex gap-x-3">
                        <FormButton buttonStyle="cancel" class="w-full" @click="state.modal.whatDoYouNeed = false">{{
                            $t('cancel') }}</FormButton>
                        <FormButton buttonStyle="primary" class="w-full" @click="saveModules">{{ $t('save') }}
                        </FormButton>
                    </div>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.modal.appInfo" :title="$t('discover.promoCta')"
                :message="$t('discover.appInfoMessage')" @close="state.modal.appInfo = false"
                @confirm="state.modal.appInfo = false" />

            <ModulesUserCitizenModalImportMapper :isModalOpen="state.modal.importMapper"
                @close="state.modal.importMapper = false" @imported="onImported" />

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { departmentService } from '@/components/api/user/DepartmentService'
import { userService } from '@/components/api/user/UserService'
import { citizenService } from '@/components/api/user/CitizenService'
import { scheduleTagService } from '@/components/api/user/ScheduleTagService'
import { companyService } from '@/components/api/user/CompanyService'
import { useUserStore } from '@/store/user'
import { usePermissions } from '@/composables/usePermissions'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { isAtLeast } = usePermissions()
const isAdmin = computed(() => isAtLeast('Admin'))

const firstName = computed(() => userStore.getUser?.firstname ?? '')

// --- "What do you need" personalisation (persisted to the company) ---
const moduleOptions = [
    { key: 'vagtplan', icon: 'ph:calendar-dots' },
    { key: 'medicin', icon: 'ph:pill' },
    { key: 'dokumentation', icon: 'ph:files' },
]

const modules = reactive<Record<string, boolean>>({ vagtplan: true, medicin: true, dokumentation: true })

const state = reactive({
    open: { migration: true, komIGang: true } as Record<string, boolean>,
    done: { departments: false, employees: false, citizens: false, shiftTags: false } as Record<string, boolean>,
    modal: { whatDoYouNeed: false, appInfo: false, importMapper: false },
})

function runStepAction(action: string) {
    if (action === 'import') state.modal.importMapper = true
}

function onImported(type: string) {
    if (type === 'employees') state.done.employees = true
    else state.done.citizens = true
}

// --- Step definitions (copy lives in i18n: discover.groups.* / discover.steps.*) ---
const groups = [
    {
        key: 'migration', icon: 'ph:download-simple', module: null, adminOnly: true,
        steps: [
            { key: 'import', action: 'import' },
        ],
    },
    {
        key: 'komIGang', icon: 'ph:buildings', module: null,
        steps: [
            { key: 'departments', tip: true, route: '/settings/departments', doneKey: 'departments' },
            { key: 'roles', route: '/settings/roles' },
            { key: 'employees', route: '/employees', doneKey: 'employees', lockedUntil: 'departments' },
        ],
    },
    {
        key: 'born', icon: 'ph:users-three', module: null,
        steps: [
            { key: 'children', route: '/citizens', doneKey: 'citizens' },
            { key: 'childData', route: '/citizens' },
        ],
    },
    {
        key: 'vagtplan', icon: 'ph:calendar-dots', module: 'vagtplan',
        steps: [
            { key: 'shiftTypes', route: '/settings/duty-shift-rules' },
            { key: 'shiftTags', route: '/settings/schedule-tags', doneKey: 'shiftTags' },
            { key: 'schedule', route: '/schedules' },
        ],
    },
    {
        key: 'medicin', icon: 'ph:pill', module: 'medicin',
        steps: [
            { key: 'medicine', route: '/settings/medicines' },
        ],
    },
    {
        key: 'dokumentation', icon: 'ph:files', module: 'dokumentation',
        steps: [
            { key: 'templates', route: '/settings/roles' },
        ],
    },
] as any[]

const visibleGroups = computed(() => groups.filter(g =>
    (g.module === null || modules[g.module]) && (!g.adminOnly || isAdmin.value)
))
const totalSteps = computed(() => visibleGroups.value.reduce((n, g) => n + g.steps.length, 0))
const totalDone = computed(() => visibleGroups.value.reduce((n, g) => n + groupDone(g), 0))
const progressPct = computed(() => totalSteps.value ? Math.round((totalDone.value / totalSteps.value) * 100) : 0)
const allDone = computed(() => totalSteps.value > 0 && totalDone.value === totalSteps.value)

// First actionable (not done, not locked) step across the visible groups.
const nextStep = computed(() => {
    for (const g of visibleGroups.value) {
        for (let i = 0; i < g.steps.length; i++) {
            if (!stepDone(g.steps[i]) && !stepLocked(g, i)) return { group: g, step: g.steps[i], index: i }
        }
    }
    return null
})

function runStep(step: any) {
    if (step.action) runStepAction(step.action)
    else navigateTo(step.route)
}

function stepDone(step: any) {
    return !!(step.doneKey && state.done[step.doneKey])
}
function groupDone(group: any) {
    return group.steps.filter((s: any) => stepDone(s)).length
}
function stepLocked(group: any, index: number) {
    const step = group.steps[index]
    if (!step.lockedUntil || stepDone(step)) return false
    return !state.done[step.lockedUntil]
}
function isOpen(key: string) { return !!state.open[key] }
function toggle(key: string) { state.open[key] = !state.open[key] }

// "What do you need" maps onto the real company modules (the Page list that
// /settings/company controls and that gates the sidebar) — one system, not two.
const CORE_PAGES = ['Economy', 'Health', 'Calendar', 'Contacts', 'Employee Group']
const MODULE_TO_PAGES: Record<string, string[]> = {
    vagtplan: ['Duty Schedule', 'Attendance'],
    medicin: ['Medicine card'],
    dokumentation: ['Documents', 'Plans and goals', 'Journals'],
}

async function syncCompanyModules() {
    try {
        const res: any = await companyService.getCompanyModules()
        const pages = res?.pages ?? []
        const enabled = new Set(CORE_PAGES)
        Object.keys(MODULE_TO_PAGES).forEach(key => {
            if (modules[key]) MODULE_TO_PAGES[key].forEach(n => enabled.add(n))
        })
        const selected = pages.filter((p: any) => enabled.has(p.name))
        await companyService.updateCompanyModules({ page_uuids: selected.map((p: any) => p.uuid) })
        if (userStore.getUser?.company) userStore.getUser.company.module_pages = selected.map((p: any) => p.name)
    } catch (e) { /* module sync is best-effort */ }
}

async function saveModules() {
    state.modal.whatDoYouNeed = false
    const preferences = { modules: { ...modules }, hidden: [] as string[] }
    if (process.client) localStorage.setItem('co_discover_modules', JSON.stringify(modules))
    try {
        await companyService.updateOnboardingPreferences({ onboarding_preferences: preferences })
        // keep the in-memory user/company in sync so a reload reflects the choice
        if (userStore.getUser?.company) userStore.getUser.company.onboarding_preferences = preferences
        // and drive the real company module enablement from the same choice
        await syncCompanyModules()
    } catch (e) { /* preferences still cached locally */ }
}

onMounted(async () => {
    // Source of truth = the real company modules (same as /settings/company).
    // Derive the coarse Discover toggles from the enabled Page list when present.
    const enabledPages = userStore.getUser?.company?.module_pages
    if (Array.isArray(enabledPages) && enabledPages.length) {
        modules.vagtplan = MODULE_TO_PAGES.vagtplan.some(n => enabledPages.includes(n))
        modules.medicin = MODULE_TO_PAGES.medicin.some(n => enabledPages.includes(n))
        modules.dokumentation = MODULE_TO_PAGES.dokumentation.some(n => enabledPages.includes(n))
    } else {
        // No company_pages rows yet → fall back to saved onboarding prefs / cache, else ask.
        const serverModules = userStore.getUser?.company?.onboarding_preferences?.modules
        if (serverModules) {
            Object.assign(modules, serverModules)
        } else if (process.client) {
            const saved = localStorage.getItem('co_discover_modules')
            if (saved) {
                try { Object.assign(modules, JSON.parse(saved)) } catch (e) { }
            } else {
                state.modal.whatDoYouNeed = true
            }
        }
    }
    // Data-derived completion (a few easy ones)
    try {
        const [d, u, c, tags] = await Promise.all([
            departmentService.getAllDepartments({}).catch(() => null),
            userService.getAllUsers({}).catch(() => null),
            citizenService.getAllCitizens({}).catch(() => null),
            scheduleTagService.getAllScheduleTags({}).catch(() => null),
        ])
        state.done.departments = (d?.data?.length ?? 0) > 0
        state.done.employees = (u?.data?.length ?? 0) > 1
        state.done.citizens = (c?.data?.length ?? 0) > 0
        state.done.shiftTags = (tags?.data?.length ?? 0) > 0
    } catch (e) { }
})
</script>
