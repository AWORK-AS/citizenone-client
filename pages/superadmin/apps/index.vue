<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>Apps - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>Apps</template>

            <div class="p-1">
                <!-- Header -->
                <ModulesSuperadminPageHeader :title="$t('superadmin.apps.pageTitle')">
                    <template #actions>
                        <button @click="showNewAppSlider = true"
                            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-tertiary bg-white border border-line-strong hover:bg-surface-canvas shadow-sm transition-colors">
                            <Icon name="ph:plus" class="w-4 h-4" />
                            {{ $t('superadmin.apps.newApp') }}
                        </button>
                    </template>
                </ModulesSuperadminPageHeader>

                <!-- Catalogue is what the store shows; sales is what it earns. -->
                <div class="mb-4 flex gap-1 rounded-lg border border-line bg-white p-1 w-fit">
                    <button type="button" v-for="tab in tabs" :key="tab.value" @click="view = tab.value"
                        class="rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors"
                        :class="view === tab.value ? 'bg-tertiary text-white' : 'text-ink-muted hover:text-ink'">
                        {{ tab.label }}
                    </button>
                </div>

                <ModulesSuperadminAppSalesOverview v-if="view === 'sales'" />

                <template v-else>
                <!-- Search, filters and view toggle. Every app is loaded at once (there are a few dozen),
                     so search and filters answer instantly and the counts are true for the whole catalogue. -->
                <div class="flex flex-wrap items-center gap-3 mb-3">
                    <SuperadminTableSearch v-model="searchQuery" :placeholder="$t('superadmin.apps.searchPlaceholder')" />

                    <select v-model="categoryFilter" :aria-label="$t('superadmin.apps.filterCategory')"
                        class="h-9 rounded-lg border border-line bg-white pl-3 pr-8 text-[13px] text-ink focus:border-tertiary focus:ring-0">
                        <option value="all">{{ $t('superadmin.apps.allCategories') }} ({{ allApps.length }})</option>
                        <option v-for="category in categories" :key="category.slug" :value="category.slug">
                            {{ category.name }} ({{ category.count }})
                        </option>
                    </select>

                    <div class="flex items-center bg-white border border-line rounded-lg p-0.5 ml-auto">
                        <button class="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                            :class="viewMode === 'grid' ? 'bg-tertiary text-white' : 'text-ink-muted'"
                            :aria-label="'Grid'" @click="viewMode = 'grid'">
                            <Icon name="ph:squares-four" class="w-4 h-4" />
                        </button>
                        <button class="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                            :class="viewMode === 'list' ? 'bg-tertiary text-white' : 'text-ink-muted'"
                            :aria-label="'List'" @click="viewMode = 'list'">
                            <Icon name="ph:list" class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <!-- Status: what a superadmin is usually looking for is the odd one out. -->
                <div class="flex flex-wrap items-center gap-2 mb-4">
                    <button v-for="status in statuses" :key="status.value" type="button"
                        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium border transition-colors"
                        :class="statusFilter === status.value
                            ? 'bg-tertiary border-tertiary text-white'
                            : 'bg-white border-line text-ink-body hover:text-ink'"
                        :aria-pressed="statusFilter === status.value" @click="statusFilter = status.value">
                        <span v-if="status.dot" class="w-1.5 h-1.5 rounded-full" :class="status.dot"></span>
                        {{ status.label }}
                        <span class="opacity-70">{{ status.count }}</span>
                    </button>

                    <span class="ml-auto text-[12px] text-ink-muted">
                        {{ $t('superadmin.apps.shownCount', { shown: visibleApps.length, total: allApps.length }) }}
                    </span>
                    <button v-if="isFiltered" type="button" class="text-[12px] font-medium text-tertiary hover:underline"
                        @click="clearFilters">
                        {{ $t('superadmin.apps.clearFilters') }}
                    </button>
                </div>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error?.message?.length > 0" />

                <div v-if="state.isLoading" class="flex justify-center py-16">
                    <Icon name="ph:spinner" class="w-7 h-7 text-accent animate-spin" />
                </div>

                <div v-else-if="!visibleApps.length"
                    class="bg-white border border-line rounded-xl flex flex-col items-center gap-3 py-16 text-ink-muted">
                    <Icon name="ph:squares-four" class="w-12 h-12 opacity-30" />
                    <p class="text-sm">{{ $t('superadmin.apps.noAppsFound') }}</p>
                    <button v-if="isFiltered" type="button" class="text-[13px] font-medium text-tertiary hover:underline"
                        @click="clearFilters">
                        {{ $t('superadmin.apps.clearFilters') }}
                    </button>
                </div>

                <!-- GRID VIEW -->
                <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="app in visibleApps" :key="app.uuid ?? app.id"
                        class="bg-white border border-line rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        @click="openEditAppSlider(app)">
                        <div class="flex items-start gap-3">
                            <ModulesSuperadminAppMark :app="app" size="lg" />
                            <div class="min-w-0 flex-1">
                                <h3 class="text-[14px] font-semibold text-ink truncate">{{ app.name }}</h3>
                                <p class="text-[11px] text-ink-muted truncate">{{ app.category?.name ?? $t('superadmin.apps.noCategory') }}</p>
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-1 mt-3">
                            <span v-for="pill in statusPills(app)" :key="pill.key" class="co-badge text-[10px]" :class="pill.class">
                                <span v-if="pill.dot" class="w-1.5 h-1.5 rounded-full" :class="pill.dot"></span>
                                {{ pill.label }}
                            </span>
                            <span v-for="badge in appBadges(app)" :key="badge.key" class="co-badge co-badge-navy text-[10px]">
                                {{ badge.label }}
                            </span>
                        </div>

                        <p v-if="app.tagline || app.description" class="text-[12px] text-ink-body mt-2 line-clamp-2">
                            {{ app.tagline || app.description }}
                        </p>

                        <div class="flex items-center justify-between mt-4 pt-3 border-t border-surface-canvas text-[12px]">
                            <span class="font-medium text-ink">{{ priceSummary(app) }}</span>
                            <span class="text-ink-muted">{{ $t('superadmin.apps.customersCount', app.install_count ?? 0) }}</span>
                        </div>
                    </div>
                </div>

                <!-- LIST VIEW, grouped by category in the order the store shows them -->
                <div v-else class="space-y-6">
                    <section v-for="group in groups" :key="group.key"
                        class="bg-white border border-line rounded-xl overflow-hidden shadow-sm">
                        <header class="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-surface-subtle">
                            <h2 class="text-[13px] font-semibold text-ink">{{ group.name }}</h2>
                            <span class="text-[12px] text-ink-muted">{{ group.apps.length }}</span>
                        </header>
                        <table class="w-full table-fixed">
                            <colgroup>
                                <col />
                                <col class="w-[220px]" />
                                <col class="w-[90px]" />
                                <col class="w-[260px]" />
                                <col class="w-[150px]" />
                            </colgroup>
                            <thead class="sr-only">
                                <tr>
                                    <th>{{ $t('superadmin.apps.colApp') }}</th>
                                    <th>{{ $t('superadmin.apps.colPrice') }}</th>
                                    <th>{{ $t('superadmin.apps.colCustomers') }}</th>
                                    <th>{{ $t('superadmin.apps.colStatus') }}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="app in group.apps" :key="app.uuid ?? app.id"
                                    class="border-b border-surface-canvas last:border-b-0 hover:bg-surface-subtle transition-colors cursor-pointer"
                                    @click="openEditAppSlider(app)">
                                    <td class="co-td">
                                        <div class="flex items-center gap-3 min-w-0">
                                            <ModulesSuperadminAppMark :app="app" />
                                            <div class="min-w-0">
                                                <div class="flex items-center gap-1.5 min-w-0">
                                                    <span class="text-[13px] font-semibold text-ink truncate">{{ app.name }}</span>
                                                    <span v-for="badge in appBadges(app)" :key="badge.key"
                                                        class="co-badge co-badge-navy text-[10px] shrink-0">{{ badge.label }}</span>
                                                </div>
                                                <p class="text-[11px] text-ink-muted truncate">{{ app.slug }}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="co-td text-[12px] text-ink">{{ priceSummary(app) }}</td>
                                    <td class="co-td text-[12px] text-ink-body tabular-nums"
                                        :title="$t('superadmin.apps.colCustomers')">
                                        {{ app.install_count ?? 0 }}
                                    </td>
                                    <td class="co-td">
                                        <div class="flex flex-wrap gap-1">
                                            <span v-for="pill in statusPills(app)" :key="pill.key" class="co-badge text-[10px]"
                                                :class="pill.class" :title="pill.title">
                                                <span v-if="pill.dot" class="w-1.5 h-1.5 rounded-full" :class="pill.dot"></span>
                                                {{ pill.label }}
                                            </span>
                                        </div>
                                    </td>
                                    <td class="co-td">
                                        <div class="flex items-center gap-2 justify-end">
                                            <button class="co-action-btn" @click.stop="openEditAppSlider(app)">
                                                <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                                {{ $t('superadmin.apps.edit') }}
                                            </button>
                                            <button class="co-icon-btn-danger" :title="$t('delete')" :aria-label="`${$t('delete')} ${app.name}`"
                                                @click.stop="confirmDelete(app)">
                                                <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                </div>

                <!-- Only when the catalogue ever outgrows one page. -->
                <Pagination v-if="(state.apps?.meta?.last_page ?? 1) > 1" :data="state.apps" @previous="previous" @next="next" />
                </template>
            </div>

            <ModulesSuperadminAppSlideOverNewApp :isOpen="showNewAppSlider" @close="showNewAppSlider = false"
                @saved="fetchApps" />

            <ModulesSuperadminAppSlideOverEditApp :isOpen="showEditAppSlider" :appUuid="editAppUuid"
                @close="showEditAppSlider = false" @saved="fetchApps" />

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('superadmin.apps.deleteConfirm', { name: state.selectedApp?.name })"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteApp" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/superadmin/AppService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const view = ref('catalogue')

const tabs = computed(() => [
    { value: 'catalogue', label: t('superadmin.apps.tabCatalogue') },
    { value: 'sales', label: t('superadmin.apps.tabSales') },
])

/** Names the parts an app still needs before the store can show it. */
function missingLabels(app: any) {
    const labels: Record<string, string> = {
        description: t('superadmin.apps.form.description'),
        category: t('apps.category'),
        tagline: t('superadmin.apps.form.tagline'),
        logo: t('superadmin.apps.form.logo'),
    }

    return (app?.missing_for_store ?? []).map((field: string) => labels[field] ?? field).join(', ')
}

let currentTablePage = 1
const route = useRoute()
const router = useRouter()

/** Filters live in the address, so a link (from the category page, or a colleague) opens the same view. */
const searchQuery = ref(String(route.query.q ?? ''))
const categoryFilter = ref(String(route.query.category ?? 'all'))
const statusFilter = ref(String(route.query.status ?? 'all'))
const viewMode = ref<'grid' | 'list'>('list')

watch([searchQuery, categoryFilter, statusFilter], () => {
    const query: Record<string, string> = {}
    if (searchQuery.value.trim()) query.q = searchQuery.value.trim()
    if (categoryFilter.value !== 'all') query.category = categoryFilter.value
    if (statusFilter.value !== 'all') query.status = statusFilter.value
    router.replace({ query })
})

const showNewAppSlider = ref(false)
const showEditAppSlider = ref(false)
const editAppUuid = ref(null) as any

const state = reactive({
    apps: [] as any,
    error: {} as Error,
    isLoading: false,
    modal: { isDeleteOpen: false },
    selectedApp: null as any,
})

const NO_CATEGORY = 'none'

const allApps = computed<any[]>(() => state.apps?.data ?? [])

/** The categories in the order the store draws its shelves, each with how many apps it holds. */
const categories = computed(() => {
    const map = new Map<string, { slug: string; name: string; sort: number; count: number }>()
    for (const app of allApps.value) {
        const slug = app.category?.slug ?? NO_CATEGORY
        const entry = map.get(slug) ?? {
            slug,
            name: app.category?.name ?? t('superadmin.apps.noCategory'),
            sort: app.category ? (app.category.sort_order ?? 0) : Number.MAX_SAFE_INTEGER,
            count: 0,
        }
        entry.count++
        map.set(slug, entry)
    }
    return [...map.values()].sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, 'da'))
})

const isLive = (app: any) => app.is_active !== false && app.is_public !== false
const isHidden = (app: any) => app.is_active !== false && app.is_public === false
const isInactive = (app: any) => app.is_active === false
const isIncomplete = (app: any) => (app.missing_for_store?.length ?? 0) > 0

const STATUS_TESTS: Record<string, (app: any) => boolean> = {
    all: () => true,
    live: isLive,
    hidden: isHidden,
    inactive: isInactive,
    incomplete: isIncomplete,
}

const inCategory = computed(() => allApps.value.filter(app =>
    categoryFilter.value === 'all' || (app.category?.slug ?? NO_CATEGORY) === categoryFilter.value))

const statuses = computed(() => [
    { value: 'all', label: t('superadmin.apps.statusAll'), dot: '' },
    { value: 'live', label: t('superadmin.apps.statusLive'), dot: 'bg-success' },
    { value: 'hidden', label: t('superadmin.apps.statusHidden'), dot: 'bg-ink-muted' },
    { value: 'inactive', label: t('superadmin.apps.inactive'), dot: 'bg-danger' },
    { value: 'incomplete', label: t('superadmin.apps.statusIncomplete'), dot: 'bg-warning' },
].map(status => ({ ...status, count: inCategory.value.filter(STATUS_TESTS[status.value]).length })))

const visibleApps = computed(() => {
    const words = searchQuery.value.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const test = STATUS_TESTS[statusFilter.value] ?? STATUS_TESTS.all
    return inCategory.value.filter(app => {
        if (!test(app)) return false
        const haystack = [app.name, app.slug, app.tagline, app.description, app.category?.name, app.type]
            .filter(Boolean).join(' ').toLowerCase()
        return words.every(word => haystack.includes(word))
    })
})

/** One section per category, in shelf order; within it the store's own order. */
const groups = computed(() => categories.value
    .map(category => ({
        key: category.slug,
        name: category.name,
        apps: visibleApps.value
            .filter(app => (app.category?.slug ?? NO_CATEGORY) === category.slug)
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name, 'da')),
    }))
    .filter(group => group.apps.length > 0))

const isFiltered = computed(() =>
    searchQuery.value.trim() !== '' || categoryFilter.value !== 'all' || statusFilter.value !== 'all')

function clearFilters() {
    searchQuery.value = ''
    categoryFilter.value = 'all'
    statusFilter.value = 'all'
}

function appBadges(app: any) {
    const badges = []
    if (app.is_popular) badges.push({ key: 'popular', label: t('superadmin.apps.form.popular') })
    if (app.is_news) badges.push({ key: 'news', label: t('superadmin.apps.form.news') })
    if (app.is_recommended) badges.push({ key: 'recommended', label: t('superadmin.apps.form.recommended') })
    if (app.is_thirdparty) badges.push({ key: 'thirdparty', label: t('superadmin.apps.form.thirdPartyApp') })
    return badges
}

/** Where the app stands, in the order a superadmin asks: is it on sale, and is anything missing. */
function statusPills(app: any) {
    const pills: { key: string; label: string; class: string; dot?: string; title?: string }[] = []
    if (isInactive(app)) {
        pills.push({ key: 'inactive', label: t('superadmin.apps.inactive'), class: 'co-badge-red', dot: 'bg-danger' })
    } else if (isHidden(app)) {
        pills.push({ key: 'hidden', label: t('superadmin.apps.statusHidden'), class: 'co-badge-gray', dot: 'bg-ink-muted' })
    } else {
        pills.push({ key: 'live', label: t('superadmin.apps.statusLive'), class: 'co-badge-green', dot: 'bg-success' })
    }
    if (isIncomplete(app)) {
        pills.push({
            key: 'incomplete',
            label: t('superadmin.apps.statusIncomplete'),
            class: 'co-badge-amber',
            title: t('superadmin.apps.missingForStore', { fields: missingLabels(app) }),
        })
    }
    return pills
}

const whole = new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 })
const exact = new Intl.NumberFormat('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
/** "1.490" for whole kroner, "1.393,20" for the rest: never "1.393,2". */
const kroner = { format: (n: number) => (Number.isInteger(n) ? whole : exact).format(n) }

function amount(value: any): number {
    const n = parseFloat(value ?? 0)
    return Number.isNaN(n) ? 0 : n
}

/** "749 kr./md. · 8.988 kr./år", "1.500 kr. engang" or "Gratis": one line instead of two zero rows. */
function priceSummary(app: any): string {
    if (app.is_one_time_fee) {
        return amount(app.price) > 0
            ? t('superadmin.apps.priceOnce', { amount: kroner.format(amount(app.price)) })
            : t('superadmin.apps.free')
    }
    const parts = []
    if (amount(app.monthly_price) > 0) parts.push(t('superadmin.apps.pricePerMonth', { amount: kroner.format(amount(app.monthly_price)) }))
    if (amount(app.yearly_price) > 0) parts.push(t('superadmin.apps.pricePerYear', { amount: kroner.format(amount(app.yearly_price)) }))
    return parts.length ? parts.join(' · ') : t('superadmin.apps.free')
}

onMounted(() => {
    fetchApps()
})

async function fetchApps() {
    state.isLoading = true
    try {
        const response = await appService.getApplications({ page: currentTablePage, per_page: 500 })
        if (response) {
            state.apps = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function openEditAppSlider(app: any) {
    editAppUuid.value = app.uuid ?? app.id
    showEditAppSlider.value = true
}

function confirmDelete(app: any) {
    state.selectedApp = app
    state.modal.isDeleteOpen = true
}

async function deleteApp() {
    try {
        await appService.deleteApp(state.selectedApp?.uuid ?? state.selectedApp?.id)
        successAlert(
            t('superadmin.apps.successDeleted'),
            t('superadmin.apps.successDeletedBody', { name: state.selectedApp?.name })
        )
        fetchApps()
    } catch (error: any) { state.error = error }
}

function previous() {
    currentTablePage--
    fetchApps()
}

function next() {
    currentTablePage++
    fetchApps()
}
</script>

<style scoped>
.co-th {
    text-align: left;
    padding: 10px 16px;
    font-size: 11px;
    font-weight: 600;
    color: theme('colors.ink.muted');
    text-transform: uppercase;
    letter-spacing: 0.06em
}

.co-td {
    padding: 12px 16px;
    vertical-align: middle
}

.co-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    background: white;
    color: theme('colors.ink.body');
    border: 1px solid theme('colors.line.strong');
    transition: all 0.15s;
    cursor: pointer
}

.co-action-btn:hover {
    background: theme('colors.surface.canvas');
    color: theme('colors.tertiary.DEFAULT');
    border-color: theme('colors.tertiary.DEFAULT')
}

.co-action-btn-danger {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    background: white;
    color: theme('colors.danger.DEFAULT');
    border: 1px solid theme('colors.danger.line');
    transition: all 0.15s;
    cursor: pointer
}

.co-action-btn-danger:hover {
    background: theme('colors.danger.soft');
    border-color: theme('colors.danger.DEFAULT')
}

.co-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 7px;
    border-radius: 999px;
    font-weight: 600;
    white-space: nowrap
}

.co-badge-green {
    background: theme('colors.success.soft');
    color: theme('colors.success.DEFAULT')
}

.co-badge-navy {
    background: theme('colors.tertiary.soft');
    color: theme('colors.tertiary.DEFAULT')
}

.co-badge-gray {
    background: theme('colors.surface.canvas');
    color: theme('colors.ink.body')
}

.co-badge-red {
    background: theme('colors.danger.soft');
    color: theme('colors.danger.DEFAULT')
}

.co-badge-amber {
    background: theme('colors.warning.soft');
    color: theme('colors.warning.ink')
}

.co-icon-btn-danger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    color: theme('colors.ink.muted');
    border: 1px solid transparent;
    transition: all 0.15s;
    cursor: pointer
}

.co-icon-btn-danger:hover {
    background: theme('colors.danger.soft');
    color: theme('colors.danger.DEFAULT');
    border-color: theme('colors.danger.line')
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden
}
</style>
