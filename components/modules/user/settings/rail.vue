<template>
    <nav class="settings-rail" aria-label="Settings">
        <!-- Phone and tablet: the rail would push the page off screen, so it
             collapses into the current page's name and opens on demand. -->
        <button type="button" class="lg:hidden w-full flex items-center justify-between gap-2 rounded-lg bg-white ring-1 ring-slate-200 px-3 py-2.5 text-sm"
            :aria-expanded="isOpenOnMobile" @click="isOpenOnMobile = !isOpenOnMobile">
            <span class="flex min-w-0 items-center gap-2">
                <Icon name="ph:gear-six" class="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                <span class="truncate font-medium text-slate-900">{{ currentLabel }}</span>
            </span>
            <Icon name="ph:caret-down" class="size-4 shrink-0 text-slate-400 transition-transform"
                :class="isOpenOnMobile && 'rotate-180'" aria-hidden="true" />
        </button>

        <!-- The rail is navigation, so it sits on the page rather than in a card of
             its own: a second white panel beside the content panel reads as a second
             document. It scrolls with the page - a rail with its own scrollbar leaves
             two scrollable columns and cuts itself off mid-section. -->
        <div :class="['lg:block rounded-lg bg-white/60 p-2 lg:bg-transparent lg:p-0 lg:sticky lg:top-[var(--sticky-header-offset,4rem)]',
            isOpenOnMobile ? 'block mt-2 ring-1 ring-slate-200' : 'hidden']">
            <div class="relative mb-3">
                <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400"
                    aria-hidden="true" />
                <input v-model="search" type="search" :placeholder="$t('settings.nav.searchPlaceholder')"
                    class="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>

            <div class="space-y-4">
                <div v-for="section in visibleSections" :key="section.key">
                    <!-- A heading over one entry says nothing the entry does not, and the
                         non-admin rail is three personal pages that need no category. -->
                    <button v-if="sectionHasHeading(section)" type="button"
                        class="w-full flex items-center justify-between gap-2 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600"
                        :aria-expanded="!isCollapsed(section)" @click="toggleSection(section)">
                        <span class="truncate">{{ sectionLabel(section) }}</span>
                        <Icon name="ph:caret-down" class="size-3 shrink-0 transition-transform"
                            :class="isCollapsed(section) && '-rotate-90'" aria-hidden="true" />
                    </button>
                    <ul v-show="!isCollapsed(section)" class="mt-1 space-y-0.5">
                        <li v-for="entry in section.items" :key="entry.href">
                            <NuxtLink :to="entry.href" class="block rounded-lg px-3 py-2 text-sm transition-colors"
                                :class="isActive(entry)
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                                :aria-current="isActive(entry) ? 'page' : undefined"
                                @click="isOpenOnMobile = false">
                                {{ label(entry) }}
                            </NuxtLink>
                        </li>
                    </ul>
                </div>
            </div>

            <p v-if="search && visibleSections.length === 0" class="mt-3 px-2 text-sm text-slate-400">
                {{ $t('settings.catalog.noSettingsMatch', { search }) }}
            </p>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/user'
import type { SettingsNavItem, SettingsNavSection } from '@/composables/useSettingsNav'

const { t } = useI18n()
const route = useRoute()
const userStore = useUserStore() as any
const { sections, isAdmin, isItemActive } = useSettingsNav()
const { tt } = useTerminology()

// Everywhere else on /settings is either Manager-or-permission gated on its own
// backend endpoint, or has no role check at all there - this list is only the
// pages that are genuinely Admin-only server-side. Redirecting anyone else away
// from them is correct; redirecting anyone else away from anywhere else was the
// bug (AW audit, 2026-08-28).
const ADMIN_ONLY_ROUTES = [
    'settings-company',
    'settings-import',
    'settings-power-bi',
    'settings-economic',
    'settings-gdpr-retention',
    'settings-portal-access',
    'settings-support-access',
    'settings-custom-links', 'settings-custom-links-new', 'settings-custom-links-uuid-edit',
    'settings-wage-supplement-rules',
]

watch(() => userStore.getUser, (user: any) => {
    if (user == null || isAdmin.value) return
    if (ADMIN_ONLY_ROUTES.includes(route.name as string)) navigateTo('/settings/profile')
}, { immediate: true })

const search = ref('')
const isOpenOnMobile = ref(false)

// Profile is the one entry that needs no category over it - every other section
// keeps its heading even at one entry, or that entry floats between two
// categories it does not belong to.
function sectionHasHeading(section: SettingsNavSection): boolean {
    return isAdmin.value && section.key !== 'me'
}

function label(item: SettingsNavItem): string {
    return item.isTranslateName ? t(item.name) : item.name
}

// The citizen word is the company's own, so the one heading that names it is
// resolved through the terminology helper rather than read straight off the
// translation file.
function sectionLabel(section: SettingsNavSection): string {
    return tt(section.labelKey)
}

function isActive(item: SettingsNavItem): boolean {
    return isItemActive(item, route.name as string)
}

const visibleSections = computed(() => {
    const query = search.value.trim().toLowerCase()
    return sections.value
        .map((section) => ({
            ...section,
            items: query
                ? section.items.filter((item) => label(item).toLowerCase().includes(query))
                : section.items,
        }))
        .filter((section) => section.items.length > 0)
})

const currentLabel = computed(() => {
    for (const section of sections.value) {
        const match = section.items.find((item) => isActive(item))
        if (match) return label(match)
    }
    return t('settings.settings')
})

// Folding is a per-browser convenience, the same choice the sidebar sections
// make, so it lives in localStorage rather than in a column on the user. Only
// sections the person has actually folded or unfolded are stored, so the
// defaults keep applying to sections they never touched.
const COLLAPSED_KEY = 'co_settings_rail_collapsed'
const choices = ref<Record<string, boolean>>({})

onMounted(() => {
    try {
        const stored = JSON.parse(localStorage.getItem(COLLAPSED_KEY) || '{}')
        if (stored && typeof stored === 'object' && !Array.isArray(stored)) choices.value = stored
    } catch {
        choices.value = {}
    }
})

function isCollapsed(section: SettingsNavSection): boolean {
    // A search is a request to see what matches, and the section holding the
    // open page always shows, so neither can be hidden by a fold.
    if (search.value.trim()) return false
    if (activeSectionKey.value === section.key) return false
    return choices.value[section.key] ?? !!section.startsCollapsed
}

const activeSectionKey = computed(() => sections.value.find((section) => section.items.some((item) => isActive(item)))?.key)

function toggleSection(section: SettingsNavSection) {
    choices.value = { ...choices.value, [section.key]: !isCollapsed(section) }
    try {
        localStorage.setItem(COLLAPSED_KEY, JSON.stringify(choices.value))
    } catch {
        // A browser that refuses storage still gets a working rail.
    }
}
</script>
