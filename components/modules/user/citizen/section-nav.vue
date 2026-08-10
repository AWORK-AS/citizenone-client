<template>
    <div class="relative">
        <!-- Mobile: grouped dropdown -->
        <div class="block md:hidden" v-if="props.tabs.length">
            <select class="block w-full rounded-md border border-tertiary py-2 pl-3 pr-10 text-base focus:border-tertiary focus:outline-none focus:ring-tertiary-500 sm:text-sm"
                @change="changeTab(($event.target as HTMLSelectElement).value)">
                <optgroup v-for="group in mobileGroups" :key="group.key" :label="group.label ? $t(group.label) : ''">
                    <option v-for="tab in group.tabs" :key="tab.href" :value="tab.href" :selected="isActive(tab)">
                        {{ tabLabel(tab) }}
                    </option>
                </optgroup>
            </select>
        </div>

        <!-- Desktop: as many tabs as the row can fit, the rest in a categorised "More" dropdown -->
        <div v-if="props.tabs.length"
            class="hidden md:block bg-white ring-1 ring-gray-200 rounded-md pl-5 pr-5 border-l-4 border-secondary">
            <div class="border-b border-gray-200">
                <nav ref="navRef" :class="[
                    // Before the first measurement every tab is rendered, so clip that
                    // one frame instead of flashing a horizontal scrollbar. Once measured
                    // nothing overflows and the dropdown needs to escape the row.
                    visibleIndexes === null ? 'overflow-hidden' : '',
                    'flex space-x-2 items-center'
                ]">
                    <a v-for="tab in visibleTabs" :key="tab.href" :class="[
                        isActive(tab)
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'inline-flex items-center gap-1.5 px-4 py-4 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap'
                    ]" @click="navigate(tab.href)">
                        <Icon v-if="tab.icon" :name="tab.icon" class="size-4 shrink-0" aria-hidden="true" />
                        {{ tabLabel(tab) }}
                    </a>

                    <Menu v-if="overflowTabs.length" as="div" class="relative">
                        <MenuButton :class="[
                            overflowHasActive
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                            'inline-flex items-center gap-1 px-4 py-4 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap'
                        ]">
                            {{ $t('more') }}
                            <Icon name="heroicons:chevron-down" class="size-4" aria-hidden="true" />
                        </MenuButton>
                        <transition enter-active-class="transition ease-out duration-100"
                            enter-from-class="transform opacity-0 scale-95"
                            enter-to-class="transform opacity-100 scale-100"
                            leave-active-class="transition ease-in duration-75"
                            leave-from-class="transform opacity-100 scale-100"
                            leave-to-class="transform opacity-0 scale-95">
                            <MenuItems
                                class="absolute right-0 z-20 mt-1 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-[28rem] overflow-y-auto py-1">
                                <div v-for="group in overflowGroups" :key="group.key">
                                    <p v-if="group.label"
                                        class="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        {{ $t(group.label) }}
                                    </p>
                                    <MenuItem v-for="tab in group.tabs" :key="tab.href" v-slot="{ active }">
                                    <a @click="navigate(tab.href)" :class="[
                                        active || isActive(tab) ? 'bg-gray-100 text-primary' : 'text-gray-700',
                                        'flex items-center gap-2 px-4 py-2 text-sm cursor-pointer'
                                    ]">
                                        <Icon v-if="tab.icon" :name="tab.icon" class="size-4 shrink-0"
                                            aria-hidden="true" />
                                        {{ tabLabel(tab) }}
                                    </a>
                                    </MenuItem>
                                </div>
                            </MenuItems>
                        </transition>
                    </Menu>
                </nav>

                <!-- Off-screen copy of every tab. Only used to read their natural widths,
                     so the visible row can be filled to the edge before anything collapses. -->
                <div ref="measureRef" aria-hidden="true"
                    class="pointer-events-none invisible absolute left-0 top-0 h-0 overflow-hidden">
                    <div class="flex space-x-2 items-center w-max">
                        <span v-for="tab in displayTabs" :key="`measure-${tab.href}`" data-measure-tab
                            class="inline-flex shrink-0 items-center gap-1.5 px-4 py-4 border-b-2 border-transparent font-medium text-sm whitespace-nowrap">
                            <Icon v-if="tab.icon" :name="tab.icon" class="size-4 shrink-0" aria-hidden="true" />
                            {{ tabLabel(tab) }}
                        </span>
                        <span data-measure-more
                            class="inline-flex shrink-0 items-center gap-1 px-4 py-4 border-b-2 border-transparent font-medium text-sm whitespace-nowrap">
                            {{ $t('more') }}
                            <Icon name="heroicons:chevron-down" class="size-4" aria-hidden="true" />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { useI18n } from 'vue-i18n'

// Renders a citizen section navigation. Sections marked `primary` line up first,
// then the row is filled with whatever else the available width allows; only the
// sections that genuinely do not fit collapse into a categorised "More" dropdown.
// Tabs are provided by the parent (each carries `category` + `primary`);
// navigation happens here.
type SectionTab = {
    name: string
    icon?: string
    href: string
    routeNames: string[]
    category: string
    primary?: boolean
    isTranslateName?: boolean
    hidden?: boolean
}

const props = defineProps<{ tabs: SectionTab[] }>()

const route = useRoute()
const { t, locale } = useI18n()

// Most tabs carry an i18n key, but a tab may pass isTranslateName: false with
// an already-resolved label (e.g. a company's custom terminology override).
function tabLabel(tab: { name: string; isTranslateName?: boolean }): string {
    return tab.isTranslateName === false ? tab.name : t(tab.name)
}

const CATEGORY_LABELS: Record<string, string> = {
    care: 'citizens.tabs.categories.care',
    documentation: 'citizens.tabs.categories.documentation',
    time: 'citizens.tabs.categories.time',
    admin: 'citizens.tabs.categories.admin',
}
const OVERFLOW_ORDER = ['documentation', 'time', 'admin', 'care']
const MOBILE_ORDER = ['care', 'documentation', 'time', 'admin']

// Matches the `space-x-2` gap between tabs.
const GAP_PX = 8

const navRef = ref<HTMLElement | null>(null)
const measureRef = ref<HTMLElement | null>(null)
// null until the first measurement, so server-rendered markup shows every tab.
const visibleIndexes = ref<number[] | null>(null)

// Display order: primary sections first, then the rest by category, so the tabs
// that drop into "More" on a narrow window are always the least important ones.
const displayTabs = computed(() => {
    const shown = props.tabs.filter((tab) => !tab.hidden)
    const primary = shown.filter((tab) => tab.primary)
    const rest = OVERFLOW_ORDER.flatMap((key) =>
        shown.filter((tab) => !tab.primary && tab.category === key))
    const ordered = [...primary, ...rest]
    return [...ordered, ...shown.filter((tab) => !ordered.includes(tab))]
})

const visibleTabs = computed(() => {
    if (visibleIndexes.value === null) return displayTabs.value
    return visibleIndexes.value.map((index) => displayTabs.value[index]).filter(Boolean)
})
const overflowTabs = computed(() => displayTabs.value.filter((tab) => !visibleTabs.value.includes(tab)))
const overflowGroups = computed(() => buildGroups(OVERFLOW_ORDER, overflowTabs.value))
const mobileGroups = computed(() => buildGroups(MOBILE_ORDER, props.tabs.filter((tab) => !tab.hidden)))
const overflowHasActive = computed(() => overflowTabs.value.some((tab) => isActive(tab)))

function buildGroups(order: string[], tabs: SectionTab[]) {
    const extra = [...new Set(tabs.map((tab) => tab.category))].filter((key) => !order.includes(key))
    return [...order, ...extra]
        .map((key) => ({
            key,
            label: CATEGORY_LABELS[key] ?? null,
            tabs: tabs.filter((tab) => tab.category === key),
        }))
        .filter((group) => group.tabs.length > 0)
}

// Fills the row from the left. When everything fits there is no "More" button at
// all; when it does not, the active tab is kept inline so the current section is
// never hidden behind the dropdown.
function measure() {
    const nav = navRef.value
    const measureEl = measureRef.value
    if (!nav || !measureEl) return

    const available = nav.clientWidth
    const tabElements = Array.from(measureEl.querySelectorAll<HTMLElement>('[data-measure-tab]'))
    if (!available || tabElements.length !== displayTabs.value.length) return

    const widths = tabElements.map((element) => element.getBoundingClientRect().width)
    const total = widths.reduce((sum, width) => sum + width, 0) + GAP_PX * Math.max(widths.length - 1, 0)
    if (total <= available) {
        visibleIndexes.value = widths.map((_, index) => index)
        return
    }

    const moreElement = measureEl.querySelector<HTMLElement>('[data-measure-more]')
    const activeIndex = displayTabs.value.findIndex((tab) => isActive(tab))
    const chosen = new Set<number>()
    let used = moreElement ? moreElement.getBoundingClientRect().width : 0

    if (activeIndex >= 0) {
        chosen.add(activeIndex)
        used += widths[activeIndex] + GAP_PX
    }
    for (let index = 0; index < widths.length; index++) {
        if (chosen.has(index)) continue
        if (used + widths[index] + GAP_PX > available) break
        chosen.add(index)
        used += widths[index] + GAP_PX
    }
    if (!chosen.size) chosen.add(0)

    visibleIndexes.value = [...chosen].sort((a, b) => a - b)
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
    nextTick(measure)
    if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => measure())
        if (navRef.value) resizeObserver.observe(navRef.value)
        // Icons and webfonts settle after hydration and change the natural widths.
        if (measureRef.value) resizeObserver.observe(measureRef.value)
    }
    if (typeof document !== 'undefined' && document.fonts?.ready) {
        document.fonts.ready.then(() => measure()).catch(() => { })
    }
})

onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
})

// Tab set and labels change with permissions and language; the active tab
// changes on navigation and has to stay inline.
watch(displayTabs, () => {
    visibleIndexes.value = null
    nextTick(measure)
})
watch([() => route.name, locale], () => nextTick(measure))

function isActive(tab: SectionTab): boolean {
    const current = route.name as string
    return Boolean(current) && tab.routeNames?.some((name: string) => current.startsWith(name))
}

function navigate(href: string) {
    navigateTo(href)
}

function changeTab(value: string) {
    if (value) navigateTo(value)
}
</script>
