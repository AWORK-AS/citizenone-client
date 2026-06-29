<template>
    <div class="relative">
        <!-- Mobile: grouped dropdown -->
        <div class="block md:hidden" v-if="props.tabs.length">
            <select class="block w-full rounded-md border border-tertiary py-2 pl-3 pr-10 text-base focus:border-tertiary focus:outline-none focus:ring-tertiary-500 sm:text-sm"
                @change="changeTab(($event.target as HTMLSelectElement).value)">
                <optgroup v-for="group in mobileGroups" :key="group.key" :label="$t(group.label)">
                    <option v-for="tab in group.tabs" :key="tab.name" :value="tab.href" :selected="isActive(tab)">
                        {{ $t(tab.name) }}
                    </option>
                </optgroup>
            </select>
        </div>

        <!-- Desktop: primary tabs + categorised "More" dropdown -->
        <div v-if="props.tabs.length"
            class="hidden md:block bg-white ring-1 ring-gray-200 rounded-md pl-5 pr-5 border-l-4 border-secondary">
            <div class="border-b border-gray-200">
                <nav class="flex space-x-2 items-center">
                    <a v-for="tab in primaryTabs" :key="tab.name" :class="[
                        isActive(tab)
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'inline-flex items-center gap-1.5 px-4 py-4 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap'
                    ]" @click="navigate(tab.href)">
                        <Icon v-if="tab.icon" :name="tab.icon" class="size-4 shrink-0" aria-hidden="true" />
                        {{ $t(tab.name) }}
                    </a>

                    <Menu v-if="hasOverflow" as="div" class="relative">
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
                                    <p class="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        {{ $t(group.label) }}
                                    </p>
                                    <MenuItem v-for="tab in group.tabs" :key="tab.name" v-slot="{ active }">
                                    <a @click="navigate(tab.href)" :class="[
                                        active || isActive(tab) ? 'bg-gray-100 text-primary' : 'text-gray-700',
                                        'flex items-center gap-2 px-4 py-2 text-sm cursor-pointer'
                                    ]">
                                        <Icon v-if="tab.icon" :name="tab.icon" class="size-4 shrink-0"
                                            aria-hidden="true" />
                                        {{ $t(tab.name) }}
                                    </a>
                                    </MenuItem>
                                </div>
                            </MenuItems>
                        </transition>
                    </Menu>
                </nav>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

// Renders a citizen section navigation: `primary` sections show as inline tabs,
// the rest collapse into a categorised "More" dropdown. Tabs are provided by the
// parent (each carries `category` + `primary`); navigation happens here.
const props = defineProps<{
    tabs: Array<{
        name: string
        icon?: string
        href: string
        routeNames: string[]
        category: string
        primary?: boolean
        isTranslateName?: boolean
    }>
}>()

const route = useRoute()

const CATEGORY_LABELS: Record<string, string> = {
    care: 'citizens.tabs.categories.care',
    documentation: 'citizens.tabs.categories.documentation',
    time: 'citizens.tabs.categories.time',
    admin: 'citizens.tabs.categories.admin',
}
const OVERFLOW_ORDER = ['documentation', 'time', 'admin', 'care']
const MOBILE_ORDER = ['care', 'documentation', 'time', 'admin']

const primaryTabs = computed(() => props.tabs.filter((tab) => tab.primary))
const overflowGroups = computed(() => buildGroups(OVERFLOW_ORDER, (tab) => !tab.primary))
const mobileGroups = computed(() => buildGroups(MOBILE_ORDER, () => true))
const hasOverflow = computed(() => overflowGroups.value.length > 0)
const overflowHasActive = computed(() => props.tabs.some((tab) => !tab.primary && isActive(tab)))

function buildGroups(order: string[], predicate: (tab: any) => boolean) {
    return order
        .map((key) => ({
            key,
            label: CATEGORY_LABELS[key],
            tabs: props.tabs.filter((tab) => tab.category === key && predicate(tab)),
        }))
        .filter((group) => group.tabs.length > 0)
}

function isActive(tab: any): boolean {
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
