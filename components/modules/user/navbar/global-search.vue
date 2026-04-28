<template>
    <Teleport to="body">
        <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="isOpen" class="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm" @click="close">
                <div class="flex items-start justify-center pt-[15vh]" @click.stop>
                    <div
                        class="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-surface-200 overflow-hidden">
                        <div class="flex items-center gap-3 px-5 py-4 border-b border-surface-100">
                            <Icon name="heroicons:magnifying-glass" class="h-5 w-5 text-slate-400 shrink-0" />
                            <input ref="searchInput" v-model="searchQuery" type="text"
                                :placeholder="$t('globalSearch.placeholder')"
                                class="flex-1 text-base text-slate-700 placeholder-slate-400 outline-none bg-transparent" />
                            <button @click="close"
                                class="p-1 rounded-md hover:bg-surface-100 text-slate-400 hover:text-slate-600 transition-colors">
                                <Icon name="heroicons:x-mark" class="h-5 w-5" />
                            </button>
                        </div>
                        <div class="max-h-[26rem] overflow-y-auto">
                            <!-- Empty state: recent searches -->
                            <div v-if="!searchQuery">
                                <div v-if="recentSearches.length > 0" class="px-5 pt-4 pb-2">
                                    <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{{
                                        $t('globalSearch.recent') }}</p>
                                    <button v-for="term in recentSearches" :key="term"
                                        class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-surface-50 hover:text-primary transition-colors text-left"
                                        @click="searchQuery = term">
                                        <Icon name="heroicons:clock" class="h-4 w-4 text-slate-300 shrink-0" />
                                        {{ term }}
                                    </button>
                                </div>
                                <div v-else class="px-5 py-6 text-center text-sm text-slate-400">
                                    {{ $t('globalSearch.hint') }}
                                </div>
                            </div>

                            <!-- Loading state -->
                            <div v-else-if="isSearching" class="px-5 py-6 text-center text-sm text-slate-400">
                                {{ $t('globalSearch.searching') }}
                            </div>

                            <!-- Results -->
                            <div v-else-if="hasSearched">
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

const RECENT_SEARCHES_KEY = 'globalSearch_recent'
const MAX_RECENT = 5

const isOpen = ref(false)
const isSearching = ref(false)
const hasSearched = ref(false)
const searchQuery = ref('')
const recentSearches = ref<string[]>([])
const searchResults = ref<Record<string, any[]>>({})
const searchInput = ref<HTMLInputElement | null>(null)

const resultGroups = computed(() => [
    {
        key: 'citizens',
        labelKey: 'globalSearch.citizens',
        icon: 'heroicons:user-circle',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-500',
        items: searchResults.value.citizens ?? [],
        primaryLabel: (i: any) => `${i.firstname} ${i.lastname}`,
        secondaryLabel: (i: any) => i.email ?? '',
    },
    {
        key: 'employees',
        labelKey: 'globalSearch.employees',
        icon: 'heroicons:identification',
        iconBg: 'bg-violet-50',
        iconColor: 'text-violet-500',
        items: searchResults.value.employees ?? [],
        primaryLabel: (i: any) => `${i.firstname} ${i.lastname}`,
        secondaryLabel: (i: any) => i.email ?? '',
    },
    {
        key: 'invoices',
        labelKey: 'globalSearch.invoices',
        icon: 'heroicons:document-text',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-500',
        items: searchResults.value.invoices ?? [],
        primaryLabel: (i: any) => i.invoice_number ?? '',
        secondaryLabel: (i: any) => i.type ?? '',
    },
    {
        key: 'documents',
        labelKey: 'globalSearch.documents',
        icon: 'heroicons:paper-clip',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-500',
        items: searchResults.value.documents ?? [],
        primaryLabel: (i: any) => i.name ?? '',
        secondaryLabel: (i: any) => i.file_type ?? '',
    },
    {
        key: 'bookings',
        labelKey: 'globalSearch.bookings',
        icon: 'heroicons:calendar-days',
        iconBg: 'bg-sky-50',
        iconColor: 'text-sky-500',
        items: searchResults.value.bookings ?? [],
        primaryLabel: (i: any) => `${i.firstname} ${i.lastname}`,
        secondaryLabel: (i: any) => i.email ?? '',
    },
    {
        key: 'companies',
        labelKey: 'globalSearch.companies',
        icon: 'heroicons:building-office-2',
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-500',
        items: searchResults.value.companies ?? [],
        primaryLabel: (i: any) => i.name ?? '',
        secondaryLabel: (i: any) => i.cvr ?? '',
    },
])

function open() {
    isOpen.value = true
    searchQuery.value = ''
    isSearching.value = false
    hasSearched.value = false
    searchResults.value = {}
    recentSearches.value = loadRecentSearches()
    nextTick(() => searchInput.value?.focus())
}

function close() {
    isOpen.value = false
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
    recentSearches.value = recent.slice(0, MAX_RECENT)
}

function navigateToResult(group: string, item: any) {
    close()
    if (group === 'citizens') navigateTo(`/citizens/${item.uuid}`)
    else if (group === 'employees') navigateTo(`/employees/${item.uuid}/view-details`)
    else if (group === 'documents') navigateTo(`/employees/${item.user?.uuid ?? ''}/view-details`)
    else if (group === 'invoices') navigateTo(`/invoices`)
    else if (group === 'bookings') navigateTo(`/booking`)
    else if (group === 'companies') navigateTo(`/companies/${item.uuid}`)
}

async function executeSearch() {
    const query = searchQuery.value.trim()
    if (!query || query.length < 2) return
    isSearching.value = true
    try {
        const result = await generalSearchService.search({
            search: JSON.stringify(query.split(' ').filter(Boolean)),
            page_length: 5,
        })
        searchResults.value = result
        hasSearched.value = true
        saveRecentSearch(query)
    } catch {
        hasSearched.value = true
    } finally {
        isSearching.value = false
    }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (val) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    if (!val.trim() || val.trim().length < 2) {
        isSearching.value = false
        return
    }
    isSearching.value = true
    debounceTimer = setTimeout(() => executeSearch(), 400)
})

onMounted(() => {
    const handler = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open() }
        if (e.key === 'Escape' && isOpen.value) { close() }
    }
    window.addEventListener('keydown', handler)
    onUnmounted(() => window.removeEventListener('keydown', handler))
})

defineExpose({ open })
</script>
