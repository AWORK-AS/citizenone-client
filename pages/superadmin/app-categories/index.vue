<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.appCategories.pageTitle') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.appCategories.pageTitle') }}</template>

            <div class="p-1">
                <!-- Header -->
                <ModulesSuperadminPageHeader :title="$t('superadmin.appCategories.pageTitle')">
                    <template #actions>
                        <button @click="openCreate"
                            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-tertiary bg-white border border-line-strong hover:bg-surface-canvas shadow-sm transition-colors">
                            <Icon name="ph:plus" class="w-4 h-4" />
                            {{ $t('superadmin.appCategories.newCategory') }}
                        </button>
                    </template>
                </ModulesSuperadminPageHeader>

                <!-- Search -->
                <div class="flex flex-wrap items-center gap-3 mb-4">
                    <SuperadminTableSearch v-model="searchQuery"
                        :placeholder="$t('superadmin.appCategories.searchPlaceholder')" @input="debouncedSearch" />
                </div>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error?.message?.length > 0" />

                <div v-if="state.isLoading" class="flex justify-center py-16">
                    <Icon name="ph:spinner" class="w-7 h-7 text-accent animate-spin" />
                </div>

                <!-- Two categories on the same position are drawn alphabetically by the store, which
                     is rarely what anyone meant. Say so, and name them, rather than leave a silent tie. -->
                <div v-if="!state.isLoading && sharedPositions.length"
                    class="mb-4 flex items-start gap-2 rounded-lg border border-warning-line bg-warning-soft px-4 py-3 text-[13px] text-warning-ink">
                    <Icon name="ph:info" class="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{{ $t('superadmin.appCategories.sharedPositionsHint') }}</p>
                </div>

                <!-- LIST VIEW -->
                <div v-if="!state.isLoading" class="bg-white border border-line rounded-xl overflow-hidden shadow-sm">
                    <div v-if="!filteredCategories.length"
                        class="flex flex-col items-center gap-3 py-16 text-ink-muted">
                        <Icon name="ic:baseline-category" class="w-12 h-12 opacity-30" />
                        <p class="text-sm">{{ $t('superadmin.appCategories.noCategoriesFound') }}</p>
                    </div>
                    <table v-else class="w-full">
                        <thead>
                            <tr class="border-b border-line bg-surface-subtle">
                                <th class="co-th w-[90px]">{{ $t('superadmin.appCategories.colPosition') }}</th>
                                <th class="co-th">{{ $t('superadmin.appCategories.colName') }}</th>
                                <th class="co-th w-[120px]">{{ $t('superadmin.appCategories.colStatus') }}</th>
                                <th class="co-th w-[140px]">{{ $t('superadmin.appCategories.colApps') }}</th>
                                <th class="co-th w-[150px]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="category in filteredCategories" :key="category.uuid ?? category.id"
                                class="border-b border-surface-canvas last:border-b-0 hover:bg-surface-subtle transition-colors cursor-pointer"
                                @click="openEdit(category)">

                                <td class="co-td">
                                    <span class="inline-flex items-center gap-1 text-[13px] tabular-nums text-ink-body"
                                        :title="sharedWith(category).length
                                            ? $t('superadmin.appCategories.sharedPosition', { names: sharedWith(category).join(', ') })
                                            : undefined">
                                        {{ category.sort_order }}
                                        <Icon v-if="sharedWith(category).length" name="ph:warning-circle"
                                            class="w-3.5 h-3.5 text-warning" />
                                    </span>
                                </td>

                                <td class="co-td">
                                    <div class="flex items-center gap-3">
                                        <span class="w-9 h-9 shrink-0 rounded-lg bg-tertiary-soft text-tertiary flex items-center justify-center"
                                            :title="category.icon || undefined">
                                            <Icon v-if="isIconName(category.icon)" :name="category.icon" class="w-5 h-5" />
                                            <span v-else-if="category.icon" class="text-[16px] leading-none">{{ category.icon }}</span>
                                            <Icon v-else name="ic:baseline-category" class="w-5 h-5 opacity-60" />
                                        </span>
                                        <div class="min-w-0">
                                            <p class="text-[13px] font-semibold text-ink">{{ category.name }}</p>
                                            <p class="text-[11px] text-ink-muted">{{ category.slug }}</p>
                                        </div>
                                    </div>
                                </td>

                                <td class="co-td">
                                    <span v-if="category.is_active !== false"
                                        class="co-badge co-badge-green text-[10px]">
                                        <span class="w-1.5 h-1.5 rounded-full bg-success"></span>
                                        {{ $t('superadmin.appCategories.active') }}
                                    </span>
                                    <span v-else class="co-badge co-badge-gray text-[10px]">
                                        {{ $t('superadmin.appCategories.inactive') }}
                                    </span>
                                </td>

                                <!-- The count is the way into the apps: it opens the app list on this category. -->
                                <td class="co-td">
                                    <NuxtLink v-if="(category.applications_count ?? 0) > 0"
                                        :to="{ path: '/superadmin/apps', query: { category: category.slug } }"
                                        class="inline-flex items-center gap-1 text-[13px] font-medium text-tertiary hover:underline"
                                        @click.stop>
                                        {{ $t('superadmin.appCategories.appsCount', category.applications_count) }}
                                        <Icon name="ph:arrow-right" class="w-3.5 h-3.5" />
                                    </NuxtLink>
                                    <span v-else class="text-[13px] text-ink-muted">
                                        {{ $t('superadmin.appCategories.noApps') }}
                                    </span>
                                </td>

                                <td class="co-td">
                                    <div class="flex items-center gap-2 justify-end">
                                        <button class="co-action-btn" @click.stop="openEdit(category)">
                                            <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                            {{ $t('superadmin.appCategories.edit') }}
                                        </button>
                                        <!-- A category with apps cannot be deleted from here: the apps would be
                                             left without a shelf in the store. -->
                                        <button class="co-icon-btn-danger"
                                            :disabled="(category.applications_count ?? 0) > 0"
                                            :title="(category.applications_count ?? 0) > 0
                                                ? $t('superadmin.appCategories.cannotDelete')
                                                : $t('delete')"
                                            :aria-label="`${$t('delete')} ${category.name}`"
                                            @click.stop="confirmDelete(category)">
                                            <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Only if there are ever more categories than one request returns. -->
                <Pagination v-if="(state.categories?.meta?.last_page ?? 1) > 1" :data="state.categories"
                    @previous="previous" @next="next" />
            </div>

            <ModulesSuperadminAppCategoryModalCategory :isOpen="showModal" :category="selectedCategory"
                @close="showModal = false" @saved="fetchCategories" />

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('superadmin.appCategories.deleteConfirm', { name: state.selectedCategory?.name })"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteCategory" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appCategoryService } from '@/components/api/superadmin/AppCategoryService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

let currentTablePage = 1
let searchTimeout: any = null
const searchQuery = ref('')

const showModal = ref(false)
const selectedCategory = ref(null) as any

const state = reactive({
    categories: [] as any,
    dataFilter: { search: null as any },
    error: {} as Error,
    isLoading: false,
    modal: { isDeleteOpen: false },
    selectedCategory: null as any,
})

/** In the order the store draws them: position first, then name, which is how ties are broken. */
const filteredCategories = computed<any[]>(() => [...(state.categories?.data ?? [])]
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || String(a.name).localeCompare(String(b.name), 'da')))

/** The other categories on the same position as this one. */
function sharedWith(category: any): string[] {
    return filteredCategories.value
        .filter((other: any) => other !== category && (other.sort_order ?? 0) === (category.sort_order ?? 0))
        .map((other: any) => other.name)
}

const sharedPositions = computed(() => filteredCategories.value.filter((category: any) => sharedWith(category).length > 0))

/** "ph:sparkle" is an icon; anything else in the field (an emoji, per the form's hint) is shown as text. */
const isIconName = (icon: any) => typeof icon === 'string' && /^[a-z0-9-]+:[a-z0-9-]+$/i.test(icon)

onMounted(() => {
    fetchCategories()
})

async function fetchCategories() {
    state.isLoading = true
    try {
        // Every category at once: there are about a dozen, and ten per page hid the last two.
        const params: any = { page: currentTablePage, per_page: 100, ...state.dataFilter }
        const response = await appCategoryService.getCategories(params)
        if (response) {
            state.categories = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        const trimmed = searchQuery.value.trim()
        state.dataFilter.search = trimmed.length ? Array(trimmed.split(/\s+/)) : null
        currentTablePage = 1
        fetchCategories()
    }, 350)
}

function openCreate() {
    selectedCategory.value = null
    showModal.value = true
}

function openEdit(category: any) {
    selectedCategory.value = category
    showModal.value = true
}

function confirmDelete(category: any) {
    state.selectedCategory = category
    state.modal.isDeleteOpen = true
}

async function deleteCategory() {
    try {
        await appCategoryService.deleteCategory(state.selectedCategory?.uuid ?? state.selectedCategory?.id)
        successAlert(
            t('superadmin.appCategories.successDeleted'),
            t('superadmin.appCategories.successDeletedBody', { name: state.selectedCategory?.name })
        )
        fetchCategories()
    } catch (error: any) { state.error = error }
}

function previous() {
    currentTablePage--
    fetchCategories()
}

function next() {
    currentTablePage++
    fetchCategories()
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

.co-badge-gray {
    background: theme('colors.surface.canvas');
    color: theme('colors.ink.body')
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

.co-icon-btn-danger:hover:not(:disabled) {
    background: theme('colors.danger.soft');
    color: theme('colors.danger.DEFAULT');
    border-color: theme('colors.danger.line')
}

.co-icon-btn-danger:disabled {
    opacity: 0.35;
    cursor: not-allowed
}
</style>
