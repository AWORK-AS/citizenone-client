<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>Discover - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="[{ name: 'Hjem', href: '/overview', isTranslateName: false }, { name: 'Discover', href: '/discover', isTranslateName: false }]" />
            </template>

            <template #header>
                <div class="flex items-center gap-x-6">
                    <span class="text-primary border-b-2 border-primary pb-1 font-semibold cursor-default">Discover</span>
                    <span class="text-slate-400 hover:text-slate-600 cursor-pointer" @click="navigateTo('/overview')">Dashboard</span>
                </div>
            </template>

            <!-- Welcome -->
            <div class="mt-4 rounded-2xl bg-gradient-to-br from-primary to-[#1b6d8a] text-white p-6 md:p-8 relative overflow-hidden">
                <div class="relative z-10 max-w-2xl">
                    <h1 class="text-2xl md:text-3xl font-bold">Velkommen, {{ firstName }} 👋</h1>
                    <p class="mt-2 text-white/80">Her er din hurtige guide til at få CitizenOne sat op og i gang for jeres team.</p>
                    <div class="mt-4 flex items-center gap-x-3">
                        <button type="button" @click="state.modal.whatDoYouNeed = true"
                            class="inline-flex items-center gap-x-2 rounded-lg bg-white/15 hover:bg-white/25 px-3.5 py-2 text-sm font-medium transition-colors">
                            <Icon name="ph:sliders-horizontal" class="h-4 w-4" />
                            Hvad skal du bruge?
                        </button>
                        <span class="text-sm text-white/70">{{ totalDone }} af {{ totalSteps }} trin fuldført</span>
                    </div>
                </div>
                <Icon name="ph:compass" class="absolute -right-6 -bottom-8 h-48 w-48 text-white/10" />
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
                                <h3 class="font-semibold text-slate-900">{{ group.title }}</h3>
                                <p class="text-xs text-slate-500">{{ groupDone(group) }} af {{ group.steps.length }} fuldført</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-x-4">
                            <div class="hidden sm:block w-40 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div class="h-full bg-primary transition-all" :style="{ width: `${group.steps.length ? (groupDone(group) / group.steps.length) * 100 : 0}%` }" />
                            </div>
                            <Icon :name="isOpen(group.key) ? 'ph:caret-up' : 'ph:caret-down'" class="h-5 w-5 text-slate-400" />
                        </div>
                    </button>

                    <div v-show="isOpen(group.key)" class="px-5 pb-5 pt-1 divide-y divide-slate-100">
                        <div v-for="(step, i) in group.steps" :key="step.title"
                            class="flex items-start gap-x-4 py-4 first:pt-2">
                            <Icon :name="stepDone(step) ? 'ph:check-circle-fill' : (stepLocked(group, i) ? 'ph:lock-simple' : 'ph:circle')"
                                class="mt-0.5 h-6 w-6 shrink-0"
                                :class="stepDone(step) ? 'text-emerald-500' : (stepLocked(group, i) ? 'text-slate-300' : 'text-slate-300')" />
                            <div class="min-w-0 flex-1">
                                <p class="font-medium" :class="stepDone(step) ? 'text-slate-400 line-through' : 'text-slate-900'">{{ step.title }}</p>
                                <p class="text-sm text-slate-500 mt-0.5">{{ step.desc }}</p>
                                <div v-if="step.tip" class="mt-2 flex items-start gap-x-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                                    <Icon name="ph:lightbulb" class="h-4 w-4 shrink-0 text-amber-400" />
                                    <span>{{ step.tip }}</span>
                                </div>
                                <div class="mt-3" v-if="!stepDone(step)">
                                    <button type="button" v-if="!stepLocked(group, i)" @click="navigateTo(step.route)"
                                        class="inline-flex items-center gap-x-1.5 rounded-lg bg-primary text-white px-3.5 py-2 text-sm font-medium hover:bg-[#0d3f61] transition-colors">
                                        {{ step.cta }}
                                        <Icon name="ph:arrow-right" class="h-4 w-4" />
                                    </button>
                                    <span v-else class="inline-flex items-center gap-x-1.5 text-xs text-slate-400">
                                        <Icon name="ph:lock-simple" class="h-3.5 w-3.5" />
                                        Færdiggør trinnet ovenfor først
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Promo: mobile app -->
                <div class="rounded-2xl bg-slate-800 text-white p-6 flex items-center justify-between gap-x-4 overflow-hidden relative">
                    <div class="relative z-10">
                        <h3 class="text-lg font-semibold">Arbejd hvor som helst, på enhver enhed</h3>
                        <p class="mt-1 text-white/70 text-sm">Hent appen, så I altid har CitizenOne ved hånden.</p>
                        <button type="button" @click="state.modal.appInfo = true"
                            class="mt-3 rounded-lg bg-white text-slate-800 px-3.5 py-2 text-sm font-medium hover:bg-white/90 transition-colors">
                            Hent appen
                        </button>
                    </div>
                    <Icon name="ph:device-mobile" class="h-20 w-20 text-white/20 shrink-0" />
                </div>
            </div>

            <!-- "Hvad skal du bruge?" modal -->
            <Modal size="sm" title="Hvad skal du bruge?" :show="state.modal.whatDoYouNeed" @close="state.modal.whatDoYouNeed = false">
                <template #modal-body>
                    <p class="text-sm text-slate-600">Vælg de dele I bruger — så viser vi kun de relevante trin.</p>
                    <div class="mt-4 space-y-1">
                        <div v-for="mod in moduleOptions" :key="mod.key"
                            class="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 hover:bg-slate-50 cursor-pointer"
                            @click="modules[mod.key] = !modules[mod.key]">
                            <div class="flex items-center gap-x-2.5">
                                <Icon :name="mod.icon" class="h-5 w-5 text-primary" />
                                <span class="text-sm text-slate-800">{{ mod.label }}</span>
                            </div>
                            <FormSwitch :value="modules[mod.key]" @toggleSwitch="modules[mod.key] = !modules[mod.key]" />
                        </div>
                    </div>
                    <div class="mt-6 flex gap-x-3">
                        <FormButton buttonStyle="cancel" class="w-full" @click="state.modal.whatDoYouNeed = false">Annuller</FormButton>
                        <FormButton buttonStyle="primary" class="w-full" @click="saveModules">Gem</FormButton>
                    </div>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.modal.appInfo" title="Hent appen"
                message="App-links til App Store og Google Play kommer her i den rigtige version."
                @close="state.modal.appInfo = false" @confirm="state.modal.appInfo = false" />

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { departmentService } from '@/components/api/user/DepartmentService'
import { userService } from '@/components/api/user/UserService'
import { citizenService } from '@/components/api/user/CitizenService'
import { companyService } from '@/components/api/user/CompanyService'
import { useUserStore } from '@/store/user'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any

const firstName = computed(() => userStore.getUser?.firstname ?? '')

// --- "What do you need" personalisation (mockup: persisted to localStorage) ---
const moduleOptions = [
    { key: 'vagtplan', label: 'Vagtplan', icon: 'ph:calendar-dots' },
    { key: 'medicin', label: 'Medicin', icon: 'ph:pill' },
    { key: 'dokumentation', label: 'Dokumentation (planer, status, dokumenter)', icon: 'ph:files' },
]

const modules = reactive<Record<string, boolean>>({ vagtplan: true, medicin: true, dokumentation: true })

const state = reactive({
    open: { 'kom-i-gang': true } as Record<string, boolean>,
    done: { departments: false, employees: false, citizens: false } as Record<string, boolean>,
    modal: { whatDoYouNeed: false, appInfo: false },
})

// --- Step definitions ---
const groups = [
    {
        key: 'kom-i-gang', title: 'Kom i gang', icon: 'ph:buildings', module: null,
        steps: [
            { title: 'Opret afdelinger', desc: 'Afdelinger strukturerer personale, børn og vagtplan.', tip: 'Fx "Afdeling Nord" og "Afdeling Syd".', cta: 'Gå til Afdelinger', route: '/settings/departments', doneKey: 'departments' },
            { title: 'Roller & rettigheder', desc: 'Bestem hvad de forskellige roller må se og gøre.', cta: 'Gå til Roller', route: '/settings/roles' },
            { title: 'Inviter personale', desc: 'Tilføj jeres medarbejdere, så de kan logge ind.', cta: 'Gå til Personale', route: '/employees', doneKey: 'employees', lockedUntil: 'departments' },
        ],
    },
    {
        key: 'born', title: 'Børn', icon: 'ph:users-three', module: null,
        steps: [
            { title: 'Opret børn', desc: 'Opret de børn I arbejder med.', cta: 'Gå til Børn', route: '/citizens', doneKey: 'citizens' },
            { title: 'Stamdata & kontaktpersoner', desc: 'Udfyld stamdata, kontaktpersoner og sagsbehandler.', cta: 'Gå til Børn', route: '/citizens' },
        ],
    },
    {
        key: 'vagtplan', title: 'Vagtplan', icon: 'ph:calendar-dots', module: 'vagtplan',
        steps: [
            { title: 'Opret vagttyper & regler', desc: 'Definér vagttyper og arbejdstidsregler.', cta: 'Gå til Vagtregler', route: '/settings/duty-shift-rules' },
            { title: 'Tilføj vagt-tags', desc: 'Tags gør det let at filtrere vagter senere.', cta: 'Gå til Vagt-tags', route: '/settings/schedule-tags' },
            { title: 'Lav vagtplanen', desc: 'Planlæg de første vagter for jeres team.', cta: 'Gå til Vagtplan', route: '/schedules' },
        ],
    },
    {
        key: 'medicin', title: 'Medicin', icon: 'ph:pill', module: 'medicin',
        steps: [
            { title: 'Opsæt medicin', desc: 'Tilføj medicintyper og doseringsformer.', cta: 'Gå til Medicin', route: '/settings/medicines' },
        ],
    },
    {
        key: 'dokumentation', title: 'Dokumentation', icon: 'ph:files', module: 'dokumentation',
        steps: [
            { title: 'Statusskabeloner & planer', desc: 'Opsæt skabeloner til status, planer og mål.', cta: 'Gå til Indstillinger', route: '/settings/roles' },
        ],
    },
] as any[]

const visibleGroups = computed(() => groups.filter(g => g.module === null || modules[g.module]))
const totalSteps = computed(() => visibleGroups.value.reduce((n, g) => n + g.steps.length, 0))
const totalDone = computed(() => visibleGroups.value.reduce((n, g) => n + groupDone(g), 0))

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

async function saveModules() {
    state.modal.whatDoYouNeed = false
    const preferences = { modules: { ...modules }, hidden: [] as string[] }
    if (process.client) localStorage.setItem('co_discover_modules', JSON.stringify(modules))
    try {
        await companyService.updateOnboardingPreferences({ onboarding_preferences: preferences })
        // keep the in-memory user/company in sync so a reload reflects the choice
        if (userStore.getUser?.company) userStore.getUser.company.onboarding_preferences = preferences
    } catch (e) { /* preferences still cached locally */ }
}

onMounted(async () => {
    // Prefer server-saved preferences (company), then local cache, else ask.
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
    // Derived completion (mockup: a few easy ones)
    try {
        const [d, u, c] = await Promise.all([
            departmentService.getAllDepartments({}).catch(() => null),
            userService.getAllUsers({}).catch(() => null),
            citizenService.getAllCitizens({}).catch(() => null),
        ])
        state.done.departments = (d?.data?.length ?? 0) > 0
        state.done.employees = (u?.data?.length ?? 0) > 1
        state.done.citizens = (c?.data?.length ?? 0) > 0
    } catch (e) { }
})
</script>
