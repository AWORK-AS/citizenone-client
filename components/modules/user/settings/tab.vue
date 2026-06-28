<template>
    <!-- Admin: grouped navigation so the many settings pages stay manageable -->
    <div v-if="isAdmin" class="bg-white ring-1 ring-gray-200 rounded-md border-l-4 border-secondary px-3 py-1.5">
        <nav class="flex flex-wrap items-center gap-1">
            <template v-for="group in state.groups" :key="group.labelKey">
                <!-- single page: render as a direct link -->
                <a v-if="group.items.length === 1" @click="navigateTo(group.items[0].href)"
                    :class="[itemActive(group.items[0]) ? activeCls : inactiveCls, baseCls]">
                    {{ $t(group.labelKey) }}
                </a>
                <!-- multiple pages: render as a dropdown group -->
                <Menu v-else as="div" class="relative inline-block text-left">
                    <MenuButton :class="[groupActive(group) ? activeCls : inactiveCls, baseCls, 'inline-flex items-center gap-x-1']">
                        {{ $t(group.labelKey) }}
                        <Icon name="ph:caret-down" class="h-3.5 w-3.5" aria-hidden="true" />
                    </MenuButton>
                    <transition enter-active-class="transition duration-100 ease-out"
                        enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                        leave-active-class="transition duration-75 ease-in"
                        leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                        <MenuItems
                            class="absolute left-0 mt-2 min-w-52 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-30">
                            <div class="px-1 py-1">
                                <MenuItem v-for="item in group.items" :key="item.href" v-slot="{ active }">
                                <button
                                    :class="[active && 'bg-gray-100', itemActive(item) ? 'text-primary font-semibold' : 'text-gray-700', 'group flex w-full items-center rounded-md px-3 py-2.5 text-sm text-left']"
                                    @click="navigateTo(item.href)">
                                    {{ itemLabel(item) }}
                                </button>
                                </MenuItem>
                            </div>
                        </MenuItems>
                    </transition>
                </Menu>
            </template>
        </nav>
    </div>
    <!-- Non-admin: only two pages, keep the simple tab bar -->
    <Tabs v-else :tabs="state.tabs" :isJustifyBetween="false" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const baseCls = 'px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors'
const activeCls = 'bg-primary/10 text-primary'
const inactiveCls = 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'

const isAdmin = computed(() => userStore.getUser?.roles?.some((role: any) => role.name === 'Admin'))

const state = reactive({
    tabs: [] as any,
    groups: [] as any,
})

function itemLabel(item: any) { return item.isTranslateName ? t(item.name) : item.name }
function itemActive(item: any) { return item.routeNames?.includes(route.name as string) }
function groupActive(group: any) { return group.items.some((i: any) => itemActive(i)) }

watch(() => userStore.getUser, (newValue: any) => {
    if (newValue == null) return
    const hasAdmin = newValue?.roles?.some((role: any) => role.name === 'Admin')
    if (hasAdmin) {
        const T: Record<string, any> = {
            profile: { name: 'settings.tabs.profile', isTranslateName: true, href: '/settings/profile', routeNames: ['settings-profile'] },
            company: { name: 'settings.tabs.company', isTranslateName: true, href: '/settings/company', routeNames: ['settings-company'] },
            import: { name: 'settings.tabs.import', isTranslateName: true, href: '/settings/import', routeNames: ['settings-import'] },
            invoices: { name: 'settings.tabs.invoices', isTranslateName: true, href: '/settings/invoices', routeNames: ['settings-invoices', 'settings-invoices-invoice_uuid-invoice-details'] },
            storage: { name: 'settings.tabs.storage', isTranslateName: true, href: '/settings/storage', routeNames: ['settings-storage'] },
            licenses: { name: 'settings.tabs.licenses', isTranslateName: true, href: '/settings/license-overview', routeNames: ['settings-license-overview'] },
            subscription: { name: 'settings.tabs.subscription', isTranslateName: true, href: '/settings/subscription', routeNames: ['settings-subscription'] },
            archived: { name: 'settings.tabs.archived', isTranslateName: true, href: '/settings/archived/citizens', routeNames: ['settings-archived-citizens', 'settings-archived-employees', 'settings-archived-documents'] },
            catalog: { name: 'settings.tabs.catalog', isTranslateName: true, href: '/settings/absences', routeNames: ['settings-absences', 'settings-addictions', 'settings-booking-tags', 'settings-calendar-tags', 'settings-departments', 'settings-diagnoses', 'settings-foreign-cities', 'settings-job-titles', 'settings-journal-note-tags', 'settings-medicines', 'settings-relationships', 'settings-schedule-tags', 'settings-sections', 'settings-shifts', 'settings-units'] },
            activityLogs: { name: 'settings.tabs.activityLogs', isTranslateName: true, href: '/settings/activity-logs', routeNames: ['settings-activity-logs'] },
            timeLogs: { name: 'settings.tabs.timeLogs', isTranslateName: true, href: '/settings/time-logs', routeNames: ['settings-time-logs'] },
            other: { name: 'settings.tabs.other', isTranslateName: true, href: '/settings/custom-pages', routeNames: ['settings-custom-pages', 'settings-transactions'] },
            powerBi: { name: 'settings.tabs.powerBi', isTranslateName: true, href: '/settings/power-bi', routeNames: ['settings-power-bi'] },
        }
        state.groups = [
            { labelKey: 'settings.tabs.profile', items: [T.profile] },
            { labelKey: 'settings.groups.company', items: [T.company, T.catalog, T.import] },
            { labelKey: 'settings.groups.billing', items: [T.subscription, T.invoices, T.licenses, T.storage] },
            { labelKey: 'settings.groups.data', items: [T.archived, T.other, T.powerBi] },
            { labelKey: 'settings.groups.logs', items: [T.activityLogs, T.timeLogs] },
        ]
        state.tabs = Object.values(T)
    } else {
        const r = router?.currentRoute?.value?.name as string
        if (!['settings-profile', 'settings-time-logs'].includes(r)) {
            navigateTo('/settings/profile')
        }
        state.tabs = [
            { name: 'settings.tabs.profile', isTranslateName: true, href: '/settings/profile', routeNames: ['settings-profile'] },
            { name: 'settings.tabs.timeLogs', isTranslateName: true, href: '/settings/time-logs', routeNames: ['settings-time-logs'] },
        ]
    }
})

function changeTab(value: any) {
    navigateTo(value)
}
</script>
