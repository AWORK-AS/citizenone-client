<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.today.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.today.title') }}</template>

            <div class="p-1 max-w-5xl space-y-6">

                <!-- Greeting -->
                <ModulesSuperadminPageHeader class="!mb-0" :title="greeting">
                    <template #subtitle>
                        <span class="block first-letter:uppercase">{{ formattedDate }}</span>
                    </template>
                    <template #actions>
                        <Tooltip :text="$t('superadmin.today.refresh')" position="bottom">
                            <FormButton buttonStyle="action" :aria-label="$t('superadmin.today.refresh')" @click="fetchToday">
                                <Icon name="ph:arrows-clockwise" class="h-4 w-4" :class="{ 'animate-spin': state.isLoading }" aria-hidden="true" />
                            </FormButton>
                        </Tooltip>
                    </template>
                </ModulesSuperadminPageHeader>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- KPI chips -->
                <div v-if="state.loaded && chips.length" class="flex flex-wrap gap-2">
                    <component :is="chip.href ? NuxtLink : 'div'" v-for="chip in chips" :key="chip.key" :to="chip.href ?? undefined"
                        class="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white pl-2 pr-4 py-1.5 transition-colors"
                        :class="chip.href ? 'hover:border-primary-200 hover:bg-primary-25' : ''">
                        <span class="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50">
                            <Icon :name="chip.icon" class="h-4 w-4 text-primary" aria-hidden="true" />
                        </span>
                        <span class="text-[15px] font-semibold text-slate-900 tabular-nums">{{ chip.value }}</span>
                        <span class="text-[13px] text-slate-500">{{ $t(`superadmin.today.kpi.${chip.key}`) }}</span>
                    </component>
                </div>

                <!-- Loading -->
                <div v-if="state.isLoading && !state.loaded" class="space-y-4" aria-busy="true">
                    <div v-for="n in 3" :key="n" class="h-40 rounded-2xl border border-slate-200 bg-white animate-pulse" />
                </div>

                <template v-else-if="state.loaded">
                    <!-- Everything calm -->
                    <div v-if="clear" class="rounded-2xl border border-slate-200 bg-white px-8 py-12 text-center">
                        <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                            <Icon name="ph:check-circle" class="h-8 w-8 text-emerald-600" aria-hidden="true" />
                        </span>
                        <h2 class="mt-4 text-xl font-light text-slate-900">{{ $t('superadmin.today.allClear.title') }}</h2>
                        <p class="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                            {{ today.sections.length ? $t('superadmin.today.allClear.text') : $t('superadmin.today.allClear.noSections') }}
                        </p>
                    </div>

                    <!-- Sections with something to do -->
                    <section v-for="section in groups.open" :key="section.key"
                        class="rounded-2xl border border-slate-200 bg-white shadow-card"
                        :aria-labelledby="`today-${section.key}`">
                        <header class="flex items-center gap-3 px-5 pt-5 pb-4">
                            <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50">
                                <Icon :name="SECTION_ICONS[section.key]" class="h-5 w-5 text-primary" aria-hidden="true" />
                            </span>
                            <div class="min-w-0 flex-1">
                                <h2 :id="`today-${section.key}`" class="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
                                    {{ $t(sectionKey(section.key, 'title')) }}
                                    <span class="co-badge co-badge-navy tabular-nums">{{ section.count }}</span>
                                </h2>
                                <p class="text-[13px] text-slate-500 mt-0.5">
                                    {{ $t(sectionKey(section.key, 'hint')) }}
                                    <template v-if="section.amount">
                                        · <span class="font-medium text-slate-700 tabular-nums">{{ formatKroner(section.amount) }}</span>
                                    </template>
                                </p>
                            </div>
                            <NuxtLink :to="SECTION_HREFS[section.key]"
                                class="hidden sm:inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:text-primary-700 whitespace-nowrap">
                                {{ $t('superadmin.today.seeAll') }}
                                <Icon name="ph:arrow-right" class="h-3.5 w-3.5" aria-hidden="true" />
                            </NuxtLink>
                        </header>

                        <ul class="border-t border-slate-100 divide-y divide-slate-100">
                            <li v-for="row in section.rows" :key="row.id"
                                class="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center">
                                <div class="min-w-0 flex-1">
                                    <p class="truncate text-[14px] font-medium text-slate-900">
                                        {{ row.company?.name || row.title || '—' }}
                                    </p>
                                    <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500">
                                        <ModulesSuperadminStatusPill :variant="reasonTone(row.reason)" :dot="false"
                                            :label="$t(reasonKey(row.reason))" />
                                        <span v-if="row.company && row.title && row.title !== row.company.name" class="truncate max-w-[260px]">{{ row.title }}</span>
                                        <span v-if="row.date">{{ $t(dateLabelKey(row.date_kind), { date: todayDate(row.date) }) }}</span>
                                        <span v-if="row.meta?.days_overdue">{{ $t('superadmin.today.daysOverdue', { days: row.meta.days_overdue }, row.meta.days_overdue) }}</span>
                                        <span v-if="row.meta?.invoices > 1">{{ $t('superadmin.today.invoiceCount', { count: row.meta.invoices }) }}</span>
                                        <span v-if="row.meta?.host">{{ row.meta.host }}</span>
                                        <a v-if="row.meta?.phone" :href="`tel:${String(row.meta.phone).replace(/\s+/g, '')}`"
                                            class="font-medium text-primary hover:underline">{{ row.meta.phone }}</a>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between gap-4 sm:justify-end">
                                    <span v-if="row.amount !== null" class="text-[14px] font-semibold text-slate-900 tabular-nums">
                                        {{ formatKroner(row.amount) }}
                                    </span>
                                    <NuxtLink :to="rowHref(section.key, row)"
                                        class="inline-flex items-center gap-1.5 rounded-lg border border-primary px-[18px] py-[7px] text-[12px] font-semibold text-primary transition-colors hover:bg-primary hover:text-white whitespace-nowrap">
                                        {{ $t(sectionKey(section.key, 'action')) }}
                                        <Icon name="ph:arrow-right" class="h-3.5 w-3.5" aria-hidden="true" />
                                    </NuxtLink>
                                </div>
                            </li>
                        </ul>

                        <footer class="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                            <span class="text-[12px] text-slate-500">
                                <template v-if="hiddenCount(section)">{{ $t('superadmin.today.more', { count: hiddenCount(section) }) }}</template>
                            </span>
                            <NuxtLink :to="SECTION_HREFS[section.key]"
                                class="inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:text-primary-700">
                                {{ $t('superadmin.today.seeAll') }}
                                <Icon name="ph:arrow-right" class="h-3.5 w-3.5" aria-hidden="true" />
                            </NuxtLink>
                        </footer>
                    </section>

                    <!-- Calm sections, collapsed -->
                    <div v-if="!clear && groups.calm.length" class="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                        <p class="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                            <Icon name="ph:check-circle" class="h-4 w-4 text-emerald-600" aria-hidden="true" />
                            {{ $t('superadmin.today.allClear.title') }}
                        </p>
                        <ul class="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
                            <li v-for="section in groups.calm" :key="section.key" class="flex items-center gap-1.5 text-[13px] text-slate-500">
                                <Icon :name="SECTION_ICONS[section.key]" class="h-3.5 w-3.5" aria-hidden="true" />
                                {{ $t(sectionKey(section.key, 'empty')) }}
                            </li>
                        </ul>
                    </div>
                </template>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { resolveComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { superadminTodayService } from '@/components/api/superadmin/TodayService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'
import {
    SECTION_HREFS,
    SECTION_ICONS,
    allClear,
    todayDate,
    dateLabelKey,
    formatKroner,
    greetingKey,
    hiddenCount,
    kpiChips,
    normalizeToday,
    reasonKey,
    reasonTone,
    rowHref,
    sectionKey,
    splitSections,
    type TodayOverview,
} from '@/composables/superadminToday'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { t } = useI18n()
const NuxtLink = resolveComponent('NuxtLink')

const state = reactive({
    isLoading: false,
    loaded: false,
    error: {} as Error,
    now: new Date(),
})

const today = ref<TodayOverview>(normalizeToday(null))

const groups = computed(() => splitSections(today.value.sections))
const clear = computed(() => allClear(today.value.sections))
const chips = computed(() => kpiChips(today.value.kpis))

const greeting = computed(() => {
    const name = userStore.getUser?.firstname
    return name ? t(`${greetingKey(state.now)}Name`, { name }) : t(greetingKey(state.now))
})

const localeMap: Record<string, string> = { en: 'en-GB', dk: 'da-DK', no: 'nb-NO', sv: 'sv-SE' }
const formattedDate = computed(() => {
    const locale = localeMap[userStore.getLanguage ?? 'dk'] ?? 'da-DK'
    return state.now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

async function fetchToday() {
    state.isLoading = true
    state.error = {}
    state.now = new Date()
    try {
        today.value = normalizeToday(await superadminTodayService.getToday())
        state.loaded = true
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

onMounted(fetchToday)
</script>
