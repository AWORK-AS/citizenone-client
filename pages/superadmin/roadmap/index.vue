<template>
    <div>
        <NuxtLayout name="superadmin">
            <Head>
                <Title>{{ $t('superadmin.roadmap.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.roadmap.title') }}</template>

            <div class="p-1">
                <ModulesSuperadminPageHeader :title="$t('superadmin.roadmap.title')" :subtitle="$t('superadmin.roadmap.intro')">
                    <template #actions>
                        <template v-if="canManage">
                            <FormButton buttonStyle="secondary" @click="openImport()">
                                <Icon name="ph:upload-simple" class="h-4 w-4" /> {{ $t('superadmin.roadmap.import.button') }}
                            </FormButton>
                            <FormButton buttonStyle="primary" @click="openForm()">
                                <Icon name="ph:plus" class="h-4 w-4" /> {{ $t('superadmin.roadmap.newItem') }}
                            </FormButton>
                        </template>
                    </template>
                </ModulesSuperadminPageHeader>

                <div class="mb-4 flex flex-wrap gap-2">
                    <button v-for="status in statuses" :key="status" type="button" @click="state.activeStatus = status"
                        class="flex items-center gap-x-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                        :class="state.activeStatus === status ? 'bg-tertiary/10 text-tertiary' : 'text-gray-500 hover:bg-gray-100'">
                        {{ $t(`comingFunctions.status.${status}`) }}
                        <span class="rounded-full bg-white/70 px-1.5 text-[11px]">{{ itemsFor(status).length }}</span>
                    </button>
                </div>

                <div class="mb-4 flex flex-wrap items-center gap-2">
                    <input v-model="state.filters.search" type="search" :placeholder="$t('superadmin.roadmap.filters.search')"
                        class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none sm:w-64" />
                    <select v-model="state.filters.category" :class="filterClass">
                        <option value="">{{ $t('superadmin.roadmap.filters.allCategories') }}</option>
                        <option v-for="category in categories" :key="category" :value="category">{{ $t(`superadmin.roadmap.categories.${category}`) }}</option>
                    </select>
                    <select v-model="state.filters.priority" :class="filterClass">
                        <option value="">{{ $t('superadmin.roadmap.filters.allPriorities') }}</option>
                        <option v-for="priority in priorities" :key="priority" :value="priority">{{ $t(`superadmin.roadmap.priorities.${priority}`) }}</option>
                    </select>
                    <select v-model="state.filters.stage" :class="filterClass">
                        <option value="">{{ $t('superadmin.roadmap.filters.allStages') }}</option>
                        <option v-for="stage in stages" :key="stage" :value="stage">{{ $t(`superadmin.roadmap.stages.${stage}`) }}</option>
                    </select>
                    <select v-model="state.filters.published" :class="filterClass">
                        <option value="">{{ $t('superadmin.roadmap.filters.publishedAndDrafts') }}</option>
                        <option value="1">{{ $t('superadmin.roadmap.published') }}</option>
                        <option value="0">{{ $t('superadmin.roadmap.draft') }}</option>
                    </select>
                    <label class="inline-flex cursor-pointer items-center gap-1.5 text-sm text-gray-700">
                        <input v-model="state.filters.important" type="checkbox" />
                        <Icon name="ph:star-fill" class="h-4 w-4 text-amber-500" /> {{ $t('superadmin.roadmap.filters.importantOnly') }}
                    </label>
                    <select v-model="state.sort" :class="filterClass" class="sm:ml-auto">
                        <option value="manual">{{ $t('superadmin.roadmap.sort.manual') }}</option>
                        <option value="priority">{{ $t('superadmin.roadmap.sort.priority') }}</option>
                        <option value="requests">{{ $t('superadmin.roadmap.sort.requests') }}</option>
                    </select>
                </div>

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="!state.isLoading && !visibleItems.length"
                        class="flex flex-col items-center gap-y-2 py-12 text-center text-sm text-ink-body">
                        <Icon name="ph:map-trifold" class="h-8 w-8 text-gray-300" />
                        {{ $t('superadmin.roadmap.noItems') }}
                    </div>
                    <p v-else-if="canDrag && visibleItems.length > 1" class="mb-2 text-xs text-gray-400">
                        {{ $t('superadmin.roadmap.dragHint') }}
                    </p>
                    <ul class="space-y-3">
                        <li v-for="(item, index) in visibleItems" :key="item.uuid"
                            :draggable="canDrag" @dragstart="onDragStart(index)" @dragover.prevent="onDragOver(index)"
                            @drop.prevent="onDrop" @dragend="onDrop"
                            class="flex items-start justify-between gap-x-4 rounded-lg border bg-white p-4 transition-colors"
                            :class="state.dragIndex === index ? 'border-primary bg-primary/5' : 'border-gray-200'">
                            <div class="flex min-w-0 items-start gap-x-3">
                                <Icon v-if="canDrag" name="ph:dots-six-vertical" class="mt-0.5 h-5 w-5 flex-none cursor-grab text-gray-300" />
                                <div class="min-w-0">
                                    <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <span class="font-semibold text-gray-900">{{ item.title }}</span>
                                        <ModulesSuperadminStatusPill :variant="item.is_published ? 'success' : 'neutral'"
                                            :label="item.is_published ? $t('superadmin.roadmap.published') : $t('superadmin.roadmap.draft')" />
                                        <span v-if="item.expected_period" class="co-badge co-badge-blue">{{ item.expected_period }}</span>
                                        <span v-for="industry in item.industries" :key="industry.uuid" class="co-badge co-badge-navy">
                                            {{ industryName(industry) }}
                                        </span>
                                    </div>
                                    <div v-if="item.internal || item.requests?.length" class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                                        <Icon v-if="item.internal?.is_important" name="ph:star-fill" class="h-4 w-4 text-amber-500"
                                            :title="$t('superadmin.roadmap.internal.important')" />
                                        <span v-if="item.internal?.priority" class="rounded px-1.5 py-0.5 font-medium" :class="priorityClass[item.internal.priority]">
                                            {{ $t(`superadmin.roadmap.priorities.${item.internal.priority}`) }}
                                        </span>
                                        <span v-if="item.internal?.category" class="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">
                                            {{ $t(`superadmin.roadmap.categories.${item.internal.category}`) }}
                                        </span>
                                        <span v-if="item.internal?.stage" class="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700">
                                            {{ $t(`superadmin.roadmap.stages.${item.internal.stage}`) }}
                                        </span>
                                        <span v-if="item.internal?.owner" class="text-gray-500">
                                            <Icon name="ph:user" class="h-3.5 w-3.5" /> {{ item.internal.owner }}
                                        </span>
                                        <span v-if="item.internal?.ticket" class="text-gray-500">{{ item.internal.ticket }}</span>
                                        <span v-if="item.requests?.length" class="text-gray-500" :title="customerNames(item)">
                                            <Icon name="ph:users-three" class="h-3.5 w-3.5" />
                                            {{ $t('superadmin.roadmap.requestCount', { count: item.requests.length }) }}:
                                            {{ customerNames(item, 3) }}
                                        </span>
                                    </div>
                                    <div v-if="item.description" class="content mt-1 line-clamp-2 text-sm text-gray-600"
                                        v-safe-html="item.description"></div>
                                    <p class="mt-1 text-xs text-gray-400">
                                        {{ item.industries?.length ? $t('superadmin.roadmap.visibleToIndustries') : $t('superadmin.roadmap.visibleToEveryone') }}
                                        <template v-if="item.released_at"> · {{ $t('superadmin.roadmap.releasedOn', { date: formatDate(item.released_at) }) }}</template>
                                    </p>
                                </div>
                            </div>
                            <div v-if="canManage" class="flex flex-none items-center gap-x-2">
                                <FormButton buttonStyle="cancel" buttonSize="sm" @click="togglePublished(item)">
                                    {{ item.is_published ? $t('superadmin.roadmap.unpublish') : $t('superadmin.roadmap.publish') }}
                                </FormButton>
                                <FormButton buttonStyle="action" buttonSize="sm" @click="openForm(item)">
                                    <Icon name="ph:pencil-simple" class="h-4 w-4" />
                                </FormButton>
                                <FormButton buttonStyle="danger" buttonSize="sm" @click="confirmDelete(item)">
                                    <Icon name="ph:trash" class="h-4 w-4" />
                                </FormButton>
                            </div>
                        </li>
                    </ul>
                </LoadingSpinner>
            </div>

            <Modal size="md" :title="state.selectedItem ? $t('superadmin.roadmap.editItem') : $t('superadmin.roadmap.newItem')"
                :show="state.showForm" @close="closeForm">
                <template #modal-body>
                    <ModulesSuperadminRoadmapForm v-if="state.showForm" :selectedItem="state.selectedItem"
                        :industries="state.industries" :error="state.formError" @close="closeForm" @submitForm="saveItem" @requestsChanged="fetchItems" />
                </template>
            </Modal>

            <Modal size="md" :title="$t('superadmin.roadmap.import.title')" :show="state.importOpen" @close="state.importOpen = false">
                <template #modal-body>
                    <div class="space-y-4 pb-6 text-left text-sm">
                        <p class="text-gray-600">{{ $t('superadmin.roadmap.import.intro') }}</p>
                        <input type="file" accept=".json,application/json" @change="readImportFile" class="text-sm" />
                        <Alert type="danger" :text="state.importError" v-if="state.importError" />
                        <div v-if="state.importReport" class="space-y-1 rounded-md border border-gray-200 bg-gray-50 p-3">
                            <p class="font-medium text-gray-800">
                                {{ state.importDone ? $t('superadmin.roadmap.import.created', { count: state.importReport.created })
                                    : $t('superadmin.roadmap.import.wouldCreate', { count: state.importReport.created }) }}
                            </p>
                            <p v-if="state.importReport.skipped.length" class="text-gray-600">
                                {{ $t('superadmin.roadmap.import.skipped', { count: state.importReport.skipped.length }) }}
                            </p>
                            <p class="text-gray-600">
                                {{ $t('superadmin.roadmap.import.matched', { count: Object.keys(state.importReport.companies_matched).length }) }}
                            </p>
                            <p v-if="state.importReport.customers_unmatched.length" class="text-gray-600">
                                {{ $t('superadmin.roadmap.import.unmatched') }}: {{ state.importReport.customers_unmatched.join(', ') }}
                            </p>
                        </div>
                        <div class="flex justify-end gap-x-2">
                            <FormButton buttonStyle="cancel" @click="state.importOpen = false">{{ $t('cancel') }}</FormButton>
                            <FormButton v-if="!state.importDone" buttonStyle="primary"
                                :disabled="!state.importReport || !state.importReport.created || state.importBusy" @click="runImport(false)">
                                {{ $t('superadmin.roadmap.import.confirm', { count: state.importReport?.created ?? 0 }) }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.deleteOpen" :message="$t('superadmin.roadmap.deleteConfirm')"
                @close="state.deleteOpen = false" @confirm="doDelete" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { roadmapItemService } from '@/components/api/superadmin/RoadmapItemService'
import { industryService } from '@/components/api/superadmin/IndustryService'
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { can } = usePermissions()
const { t, locale } = useI18n()

const canManage = computed(() => can('manage_content'))

// Same order the users' page shows them in.
const statuses = ['in_progress', 'planned', 'released']
const categories = ['feature', 'improvement', 'integration', 'bug']
const priorities = ['top', 'high', 'medium', 'low']
const stages = ['idea', 'ready', 'in_development', 'qa', 'staging', 'live']
const filterClass = 'rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none'
const priorityClass: Record<string, string> = {
    top: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-600',
}

const state = reactive({
    isLoading: false,
    error: '',
    items: [] as any[],
    industries: [] as any[],
    activeStatus: 'in_progress',
    showForm: false,
    selectedItem: null as any,
    formError: {} as any,
    deleteOpen: false,
    deleteTarget: null as any,
    filters: { search: '', category: '', priority: '', stage: '', published: '', important: false },
    sort: 'manual',
    importOpen: false,
    importItems: [] as any[],
    importReport: null as any,
    importError: '',
    importBusy: false,
    importDone: false,
    dragIndex: null as number | null,
    dragFrom: null as number | null,
})

const visibleItems = computed(() => {
    const items = itemsFor(state.activeStatus)
    if (state.sort === 'priority') {
        return [...items].sort((a, b) => rank(a) - rank(b))
    }
    if (state.sort === 'requests') {
        return [...items].sort((a, b) => (b.requests?.length ?? 0) - (a.requests?.length ?? 0))
    }
    return items
})

const hasFilters = computed(() => {
    const filters = state.filters
    return !!(filters.search || filters.category || filters.priority || filters.stage || filters.published || filters.important)
})

// Dragging sets the order users see, so only on the whole, unsorted column.
const canDrag = computed(() => canManage.value && state.sort === 'manual' && !hasFilters.value)

function rank(item: any): number {
    const priority = priorities.indexOf(item.internal?.priority)
    return (item.internal?.is_important ? 0 : 10) + (priority === -1 ? priorities.length : priority)
}

function matchesFilters(item: any): boolean {
    const filters = state.filters
    const internal = item.internal ?? {}
    if (filters.category && internal.category !== filters.category) return false
    if (filters.priority && internal.priority !== filters.priority) return false
    if (filters.stage && internal.stage !== filters.stage) return false
    if (filters.important && !internal.is_important) return false
    if (filters.published && !!item.is_published !== (filters.published === '1')) return false
    if (filters.search) {
        const needle = filters.search.toLowerCase()
        const haystack = [item.title, internal.original_text, internal.notes, internal.owner, internal.ticket, internal.source_ref, customerNames(item)]
            .filter(Boolean).join(' ').toLowerCase()
        if (!haystack.includes(needle)) return false
    }
    return true
}

function itemsFor(status: string) {
    return state.items.filter((item: any) => item.status === status && matchesFilters(item))
}

function customerNames(item: any, limit = 0): string {
    const names = (item.requests ?? []).map((wish: any) => wish.company?.name || wish.customer_name).filter(Boolean)
    if (limit && names.length > limit) {
        return `${names.slice(0, limit).join(', ')} +${names.length - limit}`
    }
    return names.join(', ')
}

function openImport() {
    state.importOpen = true
    state.importItems = []
    state.importReport = null
    state.importError = ''
    state.importDone = false
}

// A JSON file with { items: [...] } (or just the list). Checked as a dry run first, so the
// numbers are known before anything is created.
async function readImportFile(event: Event) {
    state.importReport = null
    state.importError = ''
    state.importDone = false
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    try {
        const parsed = JSON.parse(await file.text())
        state.importItems = Array.isArray(parsed) ? parsed : (parsed.items ?? [])
        await runImport(true)
    } catch (error: any) {
        state.importError = error?.message ?? 'Error'
    }
}

async function runImport(dryRun: boolean) {
    if (!state.importItems.length) return
    state.importBusy = true
    state.importError = ''
    try {
        const response = await roadmapItemService.importRoadmapItems(state.importItems, dryRun)
        state.importReport = response?.data ?? null
        if (!dryRun) {
            state.importDone = true
            successAlert(`${t('alert.success')}!`, '')
            fetchItems()
        }
    } catch (error: any) {
        state.importError = error?.message ?? 'Error'
    }
    state.importBusy = false
}

onMounted(() => {
    fetchItems()
    fetchIndustries()
})

async function fetchItems() {
    state.isLoading = true
    state.error = ''
    try {
        const response = await roadmapItemService.getRoadmapItems()
        state.items = response?.data ?? []
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
    state.isLoading = false
}

async function fetchIndustries() {
    try {
        const response = await industryService.getAllIndustries()
        state.industries = response?.data ?? response ?? []
    } catch {
        // The form still works without industries: the item is then shown to everyone.
    }
}

function industryName(industry: any): string {
    return (locale.value === 'dk' ? industry.dk_name : industry.en_name) || industry.en_name || industry.dk_name
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })
}

function openForm(item: any = null) {
    state.selectedItem = item
    state.formError = {}
    state.showForm = true
}

function closeForm() {
    state.showForm = false
    state.selectedItem = null
}

async function saveItem(form: any) {
    state.formError = {}
    try {
        if (state.selectedItem) {
            await roadmapItemService.updateRoadmapItem(state.selectedItem.uuid, form)
        } else {
            await roadmapItemService.saveRoadmapItem(form)
        }
        state.activeStatus = form.status
        closeForm()
        successAlert(`${t('alert.success')}!`, '')
        fetchItems()
    } catch (error: any) {
        state.formError = error
    }
}

async function togglePublished(item: any) {
    state.error = ''
    try {
        await roadmapItemService.updateRoadmapItem(item.uuid, {
            title: item.title,
            description: item.description,
            status: item.status,
            expected_period: item.expected_period,
            is_published: !item.is_published,
            industry_uuids: (item.industries ?? []).map((industry: any) => industry.uuid),
        })
        fetchItems()
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
}

function confirmDelete(item: any) {
    state.deleteTarget = item
    state.deleteOpen = true
}

async function doDelete() {
    state.deleteOpen = false
    try {
        await roadmapItemService.deleteRoadmapItem(state.deleteTarget.uuid)
        fetchItems()
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
}

// Native drag and drop, as elsewhere in the panel: the item moves live while dragged,
// and the new order is saved once when it's dropped.
function onDragStart(index: number) {
    state.dragFrom = index
    state.dragIndex = index
}

function onDragOver(index: number) {
    if (state.dragIndex === null || state.dragIndex === index) return

    const column = [...visibleItems.value]
    const [moved] = column.splice(state.dragIndex, 1)
    column.splice(index, 0, moved)

    const others = state.items.filter((item: any) => item.status !== state.activeStatus)
    state.items = [...others, ...column]
    state.dragIndex = index
}

async function onDrop() {
    if (state.dragIndex === null) return
    const changed = state.dragIndex !== state.dragFrom
    state.dragIndex = null
    state.dragFrom = null
    if (!changed) return

    try {
        await roadmapItemService.reorderRoadmapItems(
            visibleItems.value.map((item: any, index: number) => ({ uuid: item.uuid, sort_order: index + 1 }))
        )
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
        fetchItems()
    }
}
</script>
