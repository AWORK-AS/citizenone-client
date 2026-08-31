<template>
    <nav class="catalog-shell">
        <!-- Search filters the whole catalog by label -->
        <div class="mb-4">
            <div class="relative">
                <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                    aria-hidden="true" />
                <input v-model="search" type="text" :placeholder="$t('search') + '…'"
                    class="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
        </div>

        <div class="space-y-5">
            <div v-for="group in filteredGroups" :key="group.key">
                <p class="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {{ group.label }}
                </p>
                <ul class="space-y-0.5">
                    <li v-for="tab in group.items" :key="tab.href">
                        <button type="button" @click="changeTab(tab.href)"
                            class="w-full text-left rounded-lg px-3 py-2 text-sm transition-colors" :class="isActive(tab)
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'">
                            {{ tab.isTranslateName ? $t(tab.name) : tab.name }}
                        </button>
                    </li>
                </ul>
            </div>
        </div>

        <p v-if="search && filteredGroups.length === 0" class="mt-3 px-2 text-sm text-slate-400">
            {{ $t('settings.catalog.noSettingsMatch', { search }) }}
        </p>
    </nav>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"

const props = defineProps({
    id: {
        type: String,
        required: false,
    },
})

const { t, locale } = useI18n()
const route = useRoute()

// The list itself lives in a composable: the navbar's per-page settings
// shortcut names the same pages, and two copies would drift apart the first
// time someone adds a setting.
const { catalogItems } = useSettingsCatalog()

const search = ref('')

// Category headers — keeps the long catalog scannable instead of one flat strip.
const groupOrder = ['access', 'communication', 'journal', 'health', 'schedule', 'booking', 'citizens', 'employment']
const groupLabels: Record<string, Record<string, string>> = {
    access: { dk: 'Adgang & organisation', en: 'Access & organisation', no: 'Tilgang & organisasjon', sv: 'Åtkomst & organisation' },
    communication: { dk: 'Kommunikation', en: 'Communication', no: 'Kommunikasjon', sv: 'Kommunikation' },
    journal: { dk: 'Journal & samtykke', en: 'Journals & consent', no: 'Journal & samtykke', sv: 'Journal & samtycke' },
    health: { dk: 'Medicin & helbred', en: 'Medicine & health', no: 'Medisin & helse', sv: 'Medicin & hälsa' },
    schedule: { dk: 'Vagtplan & tid', en: 'Scheduling & time', no: 'Vaktplan & tid', sv: 'Schema & tid' },
    booking: { dk: 'Booking & kalender', en: 'Booking & calendar', no: 'Booking & kalender', sv: 'Bokning & kalender' },
    citizens: { dk: 'Borgere & adresser', en: 'Citizens & addresses', no: 'Borgere & adresser', sv: 'Medborgare & adresser' },
    employment: { dk: 'Jobcenter', en: 'Jobcenter', no: 'Jobbsenter', sv: 'Jobbcenter' },
}
function groupLabel(key: string): string {
    const byLocale = groupLabels[key] || {}
    return byLocale[locale.value] || byLocale.en || key
}

function isActive(tab: any): boolean {
    return Array.isArray(tab.routeNames) && tab.routeNames.includes(route.name as string)
}

// Group the flat tab list, in a stable category order, filtered by the search box.
const filteredGroups = computed(() => {
    const q = search.value.trim().toLowerCase()
    const matches = (tab: any) => {
        if (!q) return true
        const label = (tab.isTranslateName ? t(tab.name) : tab.name) || ''
        return label.toLowerCase().includes(q)
    }
    return groupOrder
        .map((key) => ({
            key,
            label: groupLabel(key),
            items: catalogItems.value.filter((tab) => tab.group === key && matches(tab)),
        }))
        .filter((group) => group.items.length > 0)
})

function changeTab(href: string) {
    if (href) navigateTo(href)
}
</script>

<style>
/* The catalog nav floats as a left rail; the page content that follows it
   (always the `.mt-8` block on every settings catalog page) flows beside it. */
@media (min-width: 1024px) {
    .catalog-shell {
        float: left;
        width: 15rem;
        position: sticky;
        top: 1rem;
    }

    .catalog-shell+.mt-8 {
        margin-left: 16.5rem;
        margin-top: 1.25rem;
    }
}
</style>
