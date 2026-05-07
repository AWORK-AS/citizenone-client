<template>
    <Teleport to="body">
        <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="state.isOpen" class="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm" @click="close">
                <div class="flex items-start justify-center pt-[15vh]" @click.stop>
                    <div
                        class="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-surface-200 overflow-hidden">
                        <div class="flex items-center gap-3 px-5 py-4 border-b border-surface-100">
                            <Icon name="heroicons:magnifying-glass" class="h-5 w-5 text-slate-400 shrink-0" />
                            <input ref="searchInput" v-model="state.searchQuery" type="text"
                                :placeholder="$t('globalSearch.placeholder')"
                                class="flex-1 text-base text-slate-700 placeholder-slate-400 outline-none bg-transparent" />
                            <button @click="close"
                                class="p-1 rounded-md hover:bg-surface-100 text-slate-400 hover:text-slate-600 transition-colors">
                                <Icon name="heroicons:x-mark" class="h-5 w-5" />
                            </button>
                        </div>
                        <div class="max-h-[26rem] overflow-y-auto">
                            <!-- Empty state: recent searches -->
                            <div v-if="!state.searchQuery">
                                <div v-if="state.recentSearches.length > 0" class="px-5 pt-4 pb-2">
                                    <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{{
                                        $t('globalSearch.recent') }}</p>
                                    <button v-for="term in state.recentSearches" :key="term"
                                        class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-surface-50 hover:text-primary transition-colors text-left"
                                        @click="state.searchQuery = term">
                                        <Icon name="heroicons:clock" class="h-4 w-4 text-slate-300 shrink-0" />
                                        {{ term }}
                                    </button>
                                </div>
                                <div v-else class="px-5 py-6 text-center text-sm text-slate-400">
                                    {{ $t('globalSearch.hint') }}
                                </div>
                            </div>

                            <!-- Loading state -->
                            <div v-else-if="state.isSearching" class="px-5 py-6 text-center text-sm text-slate-400">
                                {{ $t('globalSearch.searching') }}
                            </div>

                            <!-- Results -->
                            <div v-else-if="state.hasSearched">
                                <template v-for="group in resultGroups" :key="group.key">
                                    <div v-if="group.items.length > 0" class="px-5 pt-4 pb-2">
                                        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{{
                                            $t(group.labelKey) }}</p>
                                        <button v-for="item in group.items" :key="item.uuid"
                                            class="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-surface-50 transition-colors text-left"
                                            @click="navigateToResult(group.key, item)">
                                            <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                                :class="group.iconBg">
                                                <Icon :name="group.icon" class="h-4 w-4" :class="group.iconColor" />
                                            </div>
                                            <div class="min-w-0">
                                                <p class="text-sm font-medium text-slate-700 truncate">{{
                                                    group.primaryLabel(item) }}</p>
                                                <p v-if="group.secondaryLabel(item)"
                                                    class="text-xs text-slate-400 truncate">{{
                                                        group.secondaryLabel(item) }}</p>
                                            </div>
                                        </button>
                                    </div>
                                </template>

                                <!-- No results -->
                                <div v-if="resultGroups.every(g => g.items.length === 0)"
                                    class="px-5 py-6 text-center text-sm text-slate-400">
                                    {{ $t('globalSearch.noResults') }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { generalSearchService } from '@/components/api/user/GeneralSearchService'
import { useUserStore } from '@/store/user'
import { useSearchHighlightStore } from '@/store/searchHighlight'
import { useI18n } from 'vue-i18n'

const RECENT_SEARCHES_KEY = 'globalSearch_recent'
const MAX_RECENT = 5

const state = reactive({
    isOpen: false,
    isSearching: false,
    hasSearched: false,
    searchQuery: '',
    recentSearches: [] as string[],
    searchResults: {} as Record<string, any[]>,
})
const searchInput = ref<HTMLInputElement | null>(null)

const userStore = useUserStore()
const highlightStore = useSearchHighlightStore()
const { t } = useI18n()
let abortController: AbortController | null = null

interface StaticPage {
    uuid: string
    titleKey: string
    sectionKey: string
    keywords: string[]
    href: string
    adminOnly: boolean
}

const STATIC_PAGES: StaticPage[] = [
    // Available to all authenticated users
    { uuid: '/settings/profile', titleKey: 'settings.tabs.profile', sectionKey: 'globalSearch.sectionSettings', keywords: ['profile', 'profil', 'personal', 'personlig', 'account', 'konto', 'password', 'adgangskode'], href: '/settings/profile', adminOnly: false },
    { uuid: '/settings/time-logs', titleKey: 'settings.tabs.timeLogs', sectionKey: 'globalSearch.sectionSettings', keywords: ['time logs', 'tidslogs', 'tidslogfiler', 'time registration', 'tidsregistrering', 'hours', 'timer'], href: '/settings/time-logs', adminOnly: false },
    // Admin / Superadmin only
    { uuid: '/settings/company', titleKey: 'settings.tabs.company', sectionKey: 'globalSearch.sectionSettings', keywords: ['company', 'virksomhed', 'organisation', 'firma'], href: '/settings/company', adminOnly: true },
    { uuid: '/settings/departments', titleKey: 'settings.tabs.departments', sectionKey: 'globalSearch.sectionSettings', keywords: ['departments', 'afdelinger', 'department', 'afdeling'], href: '/settings/departments', adminOnly: true },
    { uuid: '/settings/invoices', titleKey: 'settings.tabs.invoices', sectionKey: 'globalSearch.sectionSettings', keywords: ['invoices', 'fakturaer', 'billing', 'fakturering', 'payment', 'betaling'], href: '/settings/invoices', adminOnly: true },
    { uuid: '/settings/storage', titleKey: 'settings.tabs.storage', sectionKey: 'globalSearch.sectionSettings', keywords: ['storage', 'lager', 'files', 'filer', 'disk', 'space', 'plads'], href: '/settings/storage', adminOnly: true },
    { uuid: '/settings/license-overview', titleKey: 'settings.tabs.licenses', sectionKey: 'globalSearch.sectionSettings', keywords: ['licenses', 'licenser', 'licensoversigt', 'license overview', 'users', 'brugere'], href: '/settings/license-overview', adminOnly: true },
    { uuid: '/settings/subscription', titleKey: 'settings.tabs.subscription', sectionKey: 'globalSearch.sectionSettings', keywords: ['subscription', 'abonnement', 'plan', 'billing', 'betaling'], href: '/settings/subscription', adminOnly: true },
    { uuid: '/settings/archived/citizens', titleKey: 'settings.tabs.archived', sectionKey: 'globalSearch.sectionSettings', keywords: ['archived', 'arkiveret', 'archive', 'arkiv', 'deleted', 'slettet'], href: '/settings/archived/citizens', adminOnly: true },
    { uuid: '/settings/roles/new', titleKey: 'settings.tabs.roles', sectionKey: 'globalSearch.sectionSettings', keywords: ['roles', 'roller', 'permissions', 'rettigheder', 'access', 'adgang'], href: '/settings/roles/new', adminOnly: true },
    { uuid: '/settings/activity-logs', titleKey: 'settings.tabs.activityLogs', sectionKey: 'globalSearch.sectionSettings', keywords: ['activity logs', 'aktivitetslogfiler', 'aktivitet', 'log', 'audit', 'history', 'historik'], href: '/settings/activity-logs', adminOnly: true },
    { uuid: '/settings/medicines', titleKey: 'settings.tabs.medicines', sectionKey: 'globalSearch.sectionSettings', keywords: ['medicines', 'medicin', 'medication', 'drugs', 'lægemidler'], href: '/settings/medicines', adminOnly: true },
    { uuid: '/settings/diagnoses', titleKey: 'settings.tabs.diagnoses', sectionKey: 'globalSearch.sectionSettings', keywords: ['diagnoses', 'diagnoser', 'diagnosis', 'diagnose'], href: '/settings/diagnoses', adminOnly: true },
    { uuid: '/settings/job-titles', titleKey: 'settings.tabs.jobTitles', sectionKey: 'globalSearch.sectionSettings', keywords: ['job titles', 'jobtitler', 'job', 'title', 'stilling'], href: '/settings/job-titles', adminOnly: true },
    { uuid: '/settings/shifts', titleKey: 'settings.tabs.shifts', sectionKey: 'globalSearch.sectionSettings', keywords: ['shifts', 'vagter', 'schedule', 'vagtplan'], href: '/settings/shifts', adminOnly: true },
    { uuid: '/settings/custom-pages', titleKey: 'settings.tabs.customPages', sectionKey: 'globalSearch.sectionSettings', keywords: ['custom pages', 'ordliste', 'custom', 'pages', 'glossary'], href: '/settings/custom-pages', adminOnly: true },
    { uuid: '/employees', titleKey: 'globalSearch.employees', sectionKey: 'globalSearch.employees', keywords: ['employees', 'medarbejdere', 'staff', 'personale', 'workers', 'new employee', 'ny medarbejder'], href: '/employees', adminOnly: true },
    { uuid: '/protocols', titleKey: 'globalSearch.attendance', sectionKey: 'globalSearch.attendance', keywords: ['protocols', 'protokoller', 'attendance', 'fremmøde', 'protocol'], href: '/protocols', adminOnly: false },
]

const staticPageResults = computed(() => {
    const query = state.searchQuery.trim().toLowerCase()
    if (!query || query.length < 2) return []
    const roles: any[] = userStore.getUser?.roles ?? []
    const isAdmin = roles.some((r: any) => r.name === 'Admin' || r.name === 'Superadmin')
    return STATIC_PAGES.filter(p => {
        if (p.adminOnly && !isAdmin) return false
        return p.keywords.some(k => k.toLowerCase().includes(query)) ||
            t(p.titleKey).toLowerCase().includes(query)
    })
})

const citizenName = (item: any) => [item.citizen?.firstname, item.citizen?.lastname].filter(Boolean).join(' ')

function getFirstCitizenPage(citizenUuid: string): string {
    const pages: any[] = userStore.getUser?.pages ?? []
    const has = (name: string) => pages.some((p: any) => p.name === name)
    if (has('Journals')) return `/citizens/${citizenUuid}/journals`
    if (has('Medicine card')) return `/citizens/${citizenUuid}/medicine-journals`
    if (has('Plans and goals')) return `/citizens/${citizenUuid}/plans-and-goals/all`
    if (has('Health')) return `/citizens/${citizenUuid}/nursing-areas`
    if (has('Documents')) return `/citizens/${citizenUuid}/documents`
    if (has('Attendance')) return `/citizens/${citizenUuid}/attendance`
    if (has('Calendar')) return `/citizens/${citizenUuid}/calendar`
    if (has('Economy')) return `/citizens/${citizenUuid}/wallets`
    if (has('Contacts')) return `/citizens/${citizenUuid}/contacts`
    if (has('Employee Group')) return `/citizens/${citizenUuid}/employee-groups`
    return `/citizens`
}

const resultGroups = computed(() => [
    {
        key: 'citizens',
        labelKey: 'globalSearch.citizens',
        icon: 'heroicons:user-circle',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-500',
        items: state.searchResults.citizens ?? [],
        primaryLabel: (i: any) => [i.firstname, i.lastname].filter(Boolean).join(' '),
        secondaryLabel: (i: any) => i.email ?? '',
    },
    {
        key: 'journals',
        labelKey: 'globalSearch.journals',
        icon: 'heroicons:book-open',
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-500',
        items: state.searchResults.journals ?? [],
        primaryLabel: (i: any) => i.title ?? '',
        secondaryLabel: (i: any) => citizenName(i),
    },
    {
        key: 'medicines',
        labelKey: 'globalSearch.medicines',
        icon: 'heroicons:beaker',
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-500',
        items: state.searchResults.medicines ?? [],
        primaryLabel: (i: any) => i.medicine?.dk_name || i.medicine?.en_name || '',
        secondaryLabel: (i: any) => citizenName(i),
    },
    {
        key: 'documents',
        labelKey: 'globalSearch.documents',
        icon: 'heroicons:paper-clip',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-500',
        items: state.searchResults.documents ?? [],
        primaryLabel: (i: any) => i.name ?? '',
        secondaryLabel: (i: any) => citizenName(i),
    },
    {
        key: 'plans',
        labelKey: 'globalSearch.plans',
        icon: 'heroicons:clipboard-document-list',
        iconBg: 'bg-teal-50',
        iconColor: 'text-teal-500',
        items: state.searchResults.plans ?? [],
        primaryLabel: (i: any) => i.name ?? '',
        secondaryLabel: (i: any) => citizenName(i),
    },
    {
        key: 'health',
        labelKey: 'globalSearch.health',
        icon: 'heroicons:heart',
        iconBg: 'bg-pink-50',
        iconColor: 'text-pink-500',
        items: state.searchResults.health ?? [],
        primaryLabel: (i: any) => citizenName(i),
        secondaryLabel: (i: any) => i.date ?? '',
    },
    {
        key: 'attendance',
        labelKey: 'globalSearch.attendance',
        icon: 'heroicons:clipboard-document-check',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-500',
        items: state.searchResults.attendance ?? [],
        primaryLabel: (i: any) => i.name ?? '',
        secondaryLabel: (i: any) => i.company?.name ?? '',
    },
    {
        key: 'calendar',
        labelKey: 'globalSearch.calendar',
        icon: 'heroicons:calendar-days',
        iconBg: 'bg-sky-50',
        iconColor: 'text-sky-500',
        items: state.searchResults.calendar ?? [],
        primaryLabel: (i: any) => i.title ?? '',
        secondaryLabel: (i: any) => citizenName(i),
    },
    {
        key: 'economy',
        labelKey: 'globalSearch.economy',
        icon: 'heroicons:banknotes',
        iconBg: 'bg-lime-50',
        iconColor: 'text-lime-600',
        items: state.searchResults.economy ?? [],
        primaryLabel: (i: any) => i.name ?? '',
        secondaryLabel: (i: any) => citizenName(i),
    },
    {
        key: 'contacts',
        labelKey: 'globalSearch.contacts',
        icon: 'heroicons:user-group',
        iconBg: 'bg-violet-50',
        iconColor: 'text-violet-500',
        items: state.searchResults.contacts ?? [],
        primaryLabel: (i: any) => [i.firstname, i.lastname].filter(Boolean).join(' '),
        secondaryLabel: (i: any) => citizenName(i),
    },
    {
        key: 'pages',
        labelKey: 'globalSearch.pages',
        icon: 'heroicons:squares-2x2',
        iconBg: 'bg-slate-50',
        iconColor: 'text-slate-500',
        items: staticPageResults.value,
        primaryLabel: (i: any) => t(i.titleKey),
        secondaryLabel: (i: any) => t(i.sectionKey),
    },
])

function cancelPendingSearch() {
    if (abortController) {
        abortController.abort()
        abortController = null
    }
}

function open() {
    state.isOpen = true
    state.searchQuery = ''
    state.isSearching = false
    state.hasSearched = false
    state.searchResults = {}
    state.recentSearches = loadRecentSearches()
    nextTick(() => searchInput.value?.focus())
}

function close() {
    cancelPendingSearch()
    state.isOpen = false
}

function loadRecentSearches(): string[] {
    try {
        return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]')
    } catch {
        return []
    }
}

function saveRecentSearch(term: string) {
    const trimmed = term.trim()
    if (!trimmed) return
    const recent = loadRecentSearches().filter(t => t !== trimmed)
    recent.unshift(trimmed)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
    state.recentSearches = recent.slice(0, MAX_RECENT)
}

function navigateToResult(group: string, item: any) {
    const term = state.searchQuery.trim()
    close()
    const citizenUuid = item.citizen?.uuid
    if (group === 'citizens') {
        navigateTo(getFirstCitizenPage(item.uuid))
    } else if (group === 'journals') {
        highlightStore.set(item.uuid, term)
        navigateTo(`/citizens/${citizenUuid}/journals`)
    } else if (group === 'medicines') {
        highlightStore.set(item.uuid, term)
        navigateTo(`/citizens/${citizenUuid}/medicine-journals`)
    } else if (group === 'documents') {
        highlightStore.set(item.uuid, term)
        navigateTo(`/citizens/${citizenUuid}/documents`)
    } else if (group === 'plans') {
        highlightStore.set(item.uuid, term)
        navigateTo(`/citizens/${citizenUuid}/plans-and-goals/all`)
    } else if (group === 'health') {
        highlightStore.set(item.uuid, term)
        navigateTo(`/citizens/${citizenUuid}/nursing-areas`)
    } else if (group === 'attendance') {
        highlightStore.set(item.uuid, term)
        navigateTo(`/protocols/${item.uuid}`)
    } else if (group === 'calendar') {
        highlightStore.set(item.uuid, term)
        navigateTo(`/citizens/${citizenUuid}/calendar`)
    } else if (group === 'economy') {
        highlightStore.set(item.uuid, term)
        navigateTo(`/citizens/${citizenUuid}/wallets`)
    } else if (group === 'contacts') {
        highlightStore.set(item.uuid, term)
        navigateTo(`/citizens/${citizenUuid}/contacts`)
    } else if (group === 'pages') {
        navigateTo(item.href)
    }
}

async function executeSearch() {
    cancelPendingSearch()
    const query = state.searchQuery.trim()
    if (!query || query.length < 2) return

    abortController = new AbortController()
    const { signal } = abortController

    state.isSearching = true
    try {
        const params = {
            search: JSON.stringify([query]),
            page_length: 100,
        }
        const result = await generalSearchService.search(params, signal)
        state.searchResults = result
        state.hasSearched = true
        saveRecentSearch(query)
    } catch (e: any) {
        if (e?.name === 'AbortError') return
        state.hasSearched = true
    } finally {
        if (!signal.aborted) {
            state.isSearching = false
        }
    }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => state.searchQuery, (val) => {
    if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null }
    cancelPendingSearch()
    if (!val.trim() || val.trim().length < 2) {
        state.isSearching = false
        state.hasSearched = false
        return
    }
    state.isSearching = true
    debounceTimer = setTimeout(() => executeSearch(), 400)
})

onMounted(() => {
    const handler = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open() }
        if (e.key === 'Escape' && state.isOpen) { close() }
    }
    window.addEventListener('keydown', handler)
    onUnmounted(() => {
        window.removeEventListener('keydown', handler)
        cancelPendingSearch()
    })
})

defineExpose({ open })
</script>
