<template>
    <Menu v-if="entries.length" as="div" class="relative">
        <MenuButton :aria-label="$t('pageSettings.title')" :title="$t('pageSettings.title')"
            class="w-9 h-9 rounded-full flex items-center justify-center text-primary hover:text-primary-700 hover:bg-surface-100 transition-colors">
            <Icon name="ph:sliders-horizontal" class="h-5 w-5" aria-hidden="true" />
        </MenuButton>
        <transition enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95">
            <MenuItems
                class="absolute right-0 z-[9999] mt-2 w-72 origin-top-right rounded-xl bg-white py-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none">
                <p class="px-3.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {{ $t('pageSettings.forThisPage') }}
                </p>
                <MenuItem v-for="entry in entries" :key="entry.href" v-slot="{ active }">
                <button type="button" @click="navigateTo(entry.href)"
                    :class="[active ? 'bg-surface-100' : '', ITEM_CLASS]">
                    <span class="flex-1 text-left">{{ entry.label }}</span>
                </button>
                </MenuItem>
                <div class="my-1 border-t border-surface-200" />
                <MenuItem v-slot="{ active }">
                <button type="button" @click="navigateTo('/settings/company')"
                    :class="[active ? 'bg-surface-100' : '', ITEM_CLASS]">
                    <Icon name="ph:gear" class="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <span class="flex-1 text-left">{{ $t('pageSettings.allSettings') }}</span>
                </button>
                </MenuItem>
            </MenuItems>
        </transition>
    </Menu>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/user'
import { settingsHrefsForRoute } from '@/utils/pageSettings'

// Every setting in CitizenOne lives in one place, reached from the profile
// menu, and named after the thing it configures rather than the page it
// affects. So changing what the duty schedule offers means already knowing the
// word "vagttyper" and where the catalog hides it. This button carries the
// settings behind whatever page you are on, so the way in is on the page
// itself.
const route = useRoute()
const userStore = useUserStore() as any
const { t } = useI18n()
const { byHref } = useSettingsCatalog()

const ITEM_CLASS = 'flex w-full items-center gap-x-3 px-3.5 py-2.5 text-sm text-slate-700'

// Settings are an admin's page; showing the shortcut to anyone else would only
// promise a door that the settings pages themselves close again.
const isAdmin = computed(() => userStore.getUser?.roles?.some((role: any) => role.name === 'Admin'))

const entries = computed(() => {
    if (!isAdmin.value) return []
    return settingsHrefsForRoute(route.name as string)
        // A page listed in the map but switched off for this company (or removed
        // from the catalog) drops out rather than linking somewhere empty.
        .map((href) => ({ href, item: byHref(href) }))
        .filter((entry) => !!entry.item)
        .map((entry) => ({
            href: entry.href,
            label: entry.item!.isTranslateName ? t(entry.item!.name) : entry.item!.name,
        }))
})
</script>
