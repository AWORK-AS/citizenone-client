<template>
    <!-- The trigger in the top bar: looks like a field, opens the palette. -->
    <button type="button"
        class="group flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm text-slate-500 transition-colors hover:border-primary-200 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:w-56 lg:w-72"
        :aria-label="t('superadmin.search.trigger')" aria-haspopup="dialog" aria-keyshortcuts="Meta+K Control+K"
        @click="openPalette">
        <Icon name="ph:magnifying-glass" class="h-4 w-4 shrink-0 text-slate-400 group-hover:text-primary" />
        <span class="hidden flex-1 truncate text-left sm:inline">{{ t('superadmin.search.trigger') }}</span>
        <kbd class="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-sans text-[11px] font-semibold leading-none text-slate-500 sm:inline">
            {{ shortcut }}
        </kbd>
    </button>

    <TransitionRoot :show="isOpen" as="template" @after-leave="reset">
        <Dialog as="div" class="relative z-[70]" :initialFocus="inputRef" @close="closePalette">
            <TransitionChild as="template" enter="ease-out duration-150" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-100" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px]" aria-hidden="true" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto px-4 pt-[10vh] pb-6 sm:pt-[14vh]">
                <TransitionChild as="template" enter="ease-out duration-150" enter-from="opacity-0 scale-[0.98] -translate-y-1"
                    enter-to="opacity-100 scale-100 translate-y-0" leave="ease-in duration-100"
                    leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-[0.98]">
                    <DialogPanel
                        class="mx-auto w-full max-w-[640px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_64px_-16px_rgba(15,43,70,0.28)]">
                        <DialogTitle class="sr-only">{{ t('superadmin.search.dialogLabel') }}</DialogTitle>

                        <!-- Field -->
                        <div class="flex items-center gap-3 border-b border-slate-200 px-4">
                            <Icon v-if="status === 'loading'" name="ph:circle-notch" class="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden="true" />
                            <Icon v-else name="ph:magnifying-glass" class="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                            <input ref="inputRef" v-model="query" type="text" role="combobox" autocomplete="off"
                                spellcheck="false" aria-autocomplete="list" :aria-expanded="flatItems.length > 0"
                                :aria-controls="listboxId" :aria-activedescendant="activeId"
                                :aria-label="t('superadmin.search.dialogLabel')"
                                :placeholder="t('superadmin.search.placeholder')"
                                class="h-14 w-full border-0 bg-transparent p-0 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                                @keydown="onInputKeydown" />
                            <kbd class="hidden rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans text-[11px] font-semibold leading-none text-slate-500 sm:inline">Esc</kbd>
                        </div>

                        <!-- Results -->
                        <div ref="listRef" :id="listboxId" role="listbox" :aria-label="t('superadmin.search.dialogLabel')"
                            class="max-h-[min(60vh,480px)] overflow-y-auto overscroll-contain py-2"
                            :class="{ hidden: !indexedSections.length }">
                            <div v-for="section in indexedSections" :key="section.key" role="group"
                                :aria-labelledby="`${listboxId}-${section.key}`" class="px-2 pb-1">
                                <div :id="`${listboxId}-${section.key}`"
                                    class="flex items-center justify-between px-3 pt-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    <span>{{ t(`superadmin.search.groups.${section.key}`) }}</span>
                                    <button v-if="section.key === 'recent'" type="button" tabindex="-1"
                                        class="rounded px-1 normal-case tracking-normal text-slate-400 hover:text-primary"
                                        @click="clearRecent">
                                        {{ t('superadmin.search.clearRecent') }}
                                    </button>
                                </div>

                                <div v-for="row in section.rows" :id="optionId(row.index)" :key="row.item.id" role="option"
                                    :aria-selected="row.index === activeIndex"
                                    class="relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors"
                                    :class="row.index === activeIndex ? 'bg-primary-50' : 'hover:bg-slate-50'"
                                    @mousemove="activeIndex = row.index" @mousedown.prevent
                                    @click="select(row.item, $event)">
                                    <span v-if="row.index === activeIndex"
                                        class="absolute inset-y-2 left-0 w-[3px] rounded-full bg-primary" aria-hidden="true" />
                                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                                        :class="row.index === activeIndex ? 'border-primary-100 bg-white text-primary' : 'border-slate-200 bg-slate-50 text-slate-500'">
                                        <Icon :name="row.item.icon" class="h-4 w-4" />
                                    </span>
                                    <span class="min-w-0 flex-1">
                                        <span class="block truncate text-sm text-slate-800">
                                            <template v-for="(part, i) in highlightMatch(row.item.title, query)" :key="i">
                                                <mark v-if="part.match" class="bg-transparent font-semibold text-primary">{{ part.text }}</mark>
                                                <template v-else>{{ part.text }}</template>
                                            </template>
                                        </span>
                                        <span v-if="row.item.subtitle" class="block truncate text-xs text-slate-500">
                                            <template v-for="(part, i) in highlightMatch(row.item.subtitle, query)" :key="i">
                                                <mark v-if="part.match" class="bg-transparent font-semibold text-slate-700">{{ part.text }}</mark>
                                                <template v-else>{{ part.text }}</template>
                                            </template>
                                        </span>
                                    </span>
                                    <span v-for="badge in row.item.badges ?? []" :key="badge"
                                        class="shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-4"
                                        :class="badgeClass(badge)">
                                        {{ t(`superadmin.search.badge.${badge}`) }}
                                    </span>
                                    <Icon v-if="row.index === activeIndex" name="ph:arrow-elbow-down-left"
                                        class="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                                </div>
                            </div>
                        </div>

                        <!-- States -->
                        <div v-if="stateMessage" class="flex flex-col items-center gap-2 px-6 py-10 text-center"
                            role="status" aria-live="polite">
                            <Icon :name="stateIcon" class="h-6 w-6 text-slate-300" aria-hidden="true" />
                            <p class="text-sm text-slate-500">{{ stateMessage }}</p>
                        </div>
                        <p v-else-if="status === 'error'" class="border-t border-slate-200 px-5 py-2 text-xs text-red-600" role="status">
                            {{ t('superadmin.search.error') }}
                        </p>
                        <span v-else class="sr-only" role="status" aria-live="polite">
                            {{ t('superadmin.search.results', { count: flatItems.length }) }}
                        </span>

                        <!-- Footer -->
                        <div class="hidden items-center gap-4 border-t border-slate-200 bg-slate-50 px-4 py-2 text-[11px] text-slate-500 sm:flex">
                            <span class="flex items-center gap-1.5">
                                <kbd class="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-slate-200 bg-white px-1 font-sans text-[11px] font-semibold text-slate-500">↑</kbd><kbd class="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-slate-200 bg-white px-1 font-sans text-[11px] font-semibold text-slate-500">↓</kbd>
                                {{ t('superadmin.search.hintNavigate') }}
                            </span>
                            <span class="flex items-center gap-1.5">
                                <kbd class="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-slate-200 bg-white px-1 font-sans text-[11px] font-semibold text-slate-500">↵</kbd>
                                {{ t('superadmin.search.hintSelect') }}
                            </span>
                            <span class="flex items-center gap-1.5">
                                <kbd class="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-slate-200 bg-white px-1 font-sans text-[11px] font-semibold text-slate-500">Esc</kbd>
                                {{ t('superadmin.search.hintClose') }}
                            </span>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
/**
 * Søg overalt (⌘K / Ctrl+K) in the superadmin panel.
 *
 * Mounted once, in `layouts/superadmin.vue`: it renders its own trigger in the
 * top bar and listens for the shortcut on the window. Menu pages are matched
 * here in the browser (only the ones `useSuperadminNav` lets this colleague
 * see); companies, people, invoices and agreements come from
 * `GET /superadmin/search`, which answers only with the groups the colleague
 * may see. All ranking and keyboard logic is in `composables/superadminSearch`.
 */
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useI18n } from 'vue-i18n'
import { searchService } from '@/components/api/superadmin/SearchService'
import {
    SEARCH_DEBOUNCE_MS,
    SEARCH_MIN_QUERY,
    addRecentPick,
    buildPaletteSections,
    flattenPaletteSections,
    highlightMatch,
    isPaletteShortcut,
    matchNavPages,
    movePaletteIndex,
    navPageEntries,
    paletteKeyAction,
    paletteShortcutLabel,
    readRecentPicks,
    searchApiSections,
    writeRecentPicks,
    type PaletteItem,
    type PaletteSection,
} from '@/composables/superadminSearch'

const { t } = useI18n()
const { visible: visibleNav } = useSuperadminNav()

const listboxId = 'sa-search-listbox'

const isOpen = ref(false)
const query = ref('')
const activeIndex = ref(0)
const status = ref<'idle' | 'loading' | 'done' | 'error'>('idle')
const apiResults = ref<PaletteSection[]>([])
const recent = ref<PaletteItem[]>([])
const shortcut = ref('Ctrl K')
const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLElement | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let controller: AbortController | null = null

/* ---------------------------------------------------------------- data */

const navEntries = computed(() => navPageEntries(visibleNav.value as any, (key) => t(key)))

const pageMatches = computed(() => matchNavPages(navEntries.value, query.value))

/*
 * A recent page is shown with today's label and only while it is still in the
 * colleague's menu - a role can change, and so can the language.
 */
const recentShown = computed<PaletteItem[]>(() => recent.value.flatMap((item) => {
    if (item.group !== 'pages') return [item]
    const entry = navEntries.value.find((page) => page.href === item.href)
    return entry ? [{ ...item, title: entry.title, subtitle: entry.parent ?? null, icon: entry.icon }] : []
}))

const sections = computed(() => buildPaletteSections(query.value, pageMatches.value, apiResults.value, recentShown.value))

const flatItems = computed(() => flattenPaletteSections(sections.value))

const indexedSections = computed(() => {
    let index = 0
    return sections.value.map((section) => ({
        key: section.key,
        rows: section.items.map((item) => ({ item, index: index++ })),
    }))
})

const activeId = computed(() => (flatItems.value.length && activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined))

function optionId(index: number) {
    return `${listboxId}-option-${index}`
}

const stateMessage = computed<string | null>(() => {
    if (flatItems.value.length) return null
    const q = query.value.trim()
    if (!q) return t('superadmin.search.intro')
    if (status.value === 'loading') return t('superadmin.search.loading')
    if (status.value === 'error') return t('superadmin.search.error')
    if (q.length < SEARCH_MIN_QUERY) return t('superadmin.search.minChars')
    return t('superadmin.search.empty', { query: q })
})

const stateIcon = computed(() => {
    if (status.value === 'error') return 'ph:warning-circle'
    if (!query.value.trim()) return 'ph:magnifying-glass'
    return status.value === 'loading' ? 'ph:hourglass-medium' : 'ph:binoculars'
})

/* -------------------------------------------------------------- search */

watch(query, (value) => {
    activeIndex.value = 0
    cancelPending()

    const q = value.trim()
    if (q.length < SEARCH_MIN_QUERY) {
        apiResults.value = []
        status.value = 'idle'
        return
    }

    // The previous answer stays on screen until the new one lands, so the list
    // does not flicker on every keystroke.
    status.value = 'loading'
    debounceTimer = setTimeout(() => runSearch(q), SEARCH_DEBOUNCE_MS)
})

async function runSearch(q: string) {
    const own = new AbortController()
    controller = own

    try {
        const response = await searchService.search(q, own.signal)
        if (own.signal.aborted || q !== query.value.trim()) return
        apiResults.value = searchApiSections(response?.data?.groups)
        status.value = 'done'
        if (activeIndex.value >= flatItems.value.length) activeIndex.value = 0
    } catch (error: any) {
        if (own.signal.aborted || error?.name === 'AbortError') return
        apiResults.value = []
        status.value = 'error'
    } finally {
        if (controller === own) controller = null
    }
}

function cancelPending() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = null
    controller?.abort()
    controller = null
}

/* ------------------------------------------------------------ keyboard */

function onInputKeydown(event: KeyboardEvent) {
    if (event.isComposing) return

    const length = flatItems.value.length

    switch (paletteKeyAction(event)) {
        case 'next':
            event.preventDefault()
            activeIndex.value = movePaletteIndex(activeIndex.value, 1, length)
            break
        case 'prev':
            event.preventDefault()
            activeIndex.value = movePaletteIndex(activeIndex.value, -1, length)
            break
        case 'first':
            event.preventDefault()
            activeIndex.value = length ? 0 : -1
            break
        case 'last':
            event.preventDefault()
            activeIndex.value = length - 1
            break
        case 'select': {
            event.preventDefault()
            const item = flatItems.value[activeIndex.value]
            if (item) select(item, event)
            break
        }
        case 'close':
            event.preventDefault()
            closePalette()
            break
    }
}

watch(activeIndex, (index) => {
    nextTick(() => {
        const element = listRef.value?.querySelector<HTMLElement>(`#${CSS.escape(optionId(index))}`)
        element?.scrollIntoView({ block: 'nearest' })
    })
})

function onWindowKeydown(event: KeyboardEvent) {
    if (event.isComposing || !isPaletteShortcut(event)) return
    event.preventDefault()
    isOpen.value ? closePalette() : openPalette()
}

/* --------------------------------------------------------- open/select */

function storage(): Storage | null {
    try {
        return window.localStorage
    } catch {
        return null
    }
}

function openPalette() {
    recent.value = readRecentPicks(storage())
    activeIndex.value = 0
    isOpen.value = true
}

function closePalette() {
    isOpen.value = false
    cancelPending()
}

function reset() {
    query.value = ''
    apiResults.value = []
    status.value = 'idle'
    activeIndex.value = 0
}

function select(item: PaletteItem, event?: MouseEvent | KeyboardEvent) {
    recent.value = addRecentPick(recent.value, item)
    writeRecentPicks(storage(), recent.value)

    // ⌘/Ctrl + click or Enter opens in a new tab and leaves the palette open.
    if (event && (event.metaKey || event.ctrlKey)) {
        window.open(item.href, '_blank', 'noopener')
        return
    }

    closePalette()
    navigateTo(item.href)
}

function clearRecent() {
    recent.value = []
    writeRecentPicks(storage(), [])
    inputRef.value?.focus()
}

function badgeClass(badge: string): string {
    switch (badge) {
        case 'failed':
            return 'border-danger-line bg-danger-soft text-danger-ink'
        case 'unpaid':
            return 'border-warning-line bg-warning-soft text-warning-ink'
        case 'paid':
            return 'border-success-line bg-success-soft text-success-ink'
        case 'billingCard':
        case 'billingInvoice':
            return 'border-primary-100 bg-primary-25 text-primary'
        default:
            return 'border-line bg-surface-canvas text-ink-body'
    }
}

onMounted(() => {
    shortcut.value = paletteShortcutLabel(navigator.platform || navigator.userAgent)
    window.addEventListener('keydown', onWindowKeydown)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onWindowKeydown)
    cancelPending()
})
</script>
