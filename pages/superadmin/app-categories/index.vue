<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.appCategories.pageTitle') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.appCategories.pageTitle') }}</template>

            <div class="p-1">
                <!-- Header -->
                <div class="flex items-center justify-between mb-5">
                    <h1 class="text-[22px] font-semibold text-[#1F2533]">
                        {{ $t('superadmin.appCategories.pageTitle') }}
                    </h1>
                    <button @click="openCreate"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-[#205E77] bg-white border border-[#D5D9E2] hover:bg-[#F5F6F8] shadow-sm transition-colors">
                        <Icon name="ph:plus" class="w-4 h-4" />
                        {{ $t('superadmin.appCategories.newCategory') }}
                    </button>
                </div>

                <!-- Search -->
                <div class="flex flex-wrap items-center gap-3 mb-4">
                    <SuperadminTableSearch v-model="searchQuery"
                        :placeholder="$t('superadmin.appCategories.searchPlaceholder')" @input="debouncedSearch" />
                </div>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error?.message?.length > 0" />

                <div v-if="state.isLoading" class="flex justify-center py-16">
                    <Icon name="ph:spinner" class="w-7 h-7 text-[#42AED9] animate-spin" />
                </div>

                <!-- LIST VIEW -->
                <div v-else class="bg-white border border-[#EAECF0] rounded-xl overflow-hidden shadow-sm">
                    <div v-if="!filteredCategories.length"
                        class="flex flex-col items-center gap-3 py-16 text-[#8891A4]">
                        <Icon name="ic:baseline-category" class="w-12 h-12 opacity-30" />
                        <p class="text-sm">{{ $t('superadmin.appCategories.noCategoriesFound') }}</p>
                    </div>
                    <table v-else class="w-full">
                        <thead>
                            <tr class="border-b border-[#EAECF0] bg-[#F9FAFB]">
                                <th class="co-th">{{ $t('superadmin.appCategories.colName') }}</th>
                                <th class="co-th">{{ $t('superadmin.appCategories.colSlug') }}</th>
                                <th class="co-th">{{ $t('superadmin.appCategories.colIcon') }}</th>
                                <th class="co-th">{{ $t('superadmin.appCategories.colSortOrder') }}</th>
                                <th class="co-th">{{ $t('superadmin.appCategories.colStatus') }}</th>
                                <th class="co-th">{{ $t('superadmin.appCategories.colApps') }}</th>
                                <th class="co-th"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="category in filteredCategories" :key="category.uuid ?? category.id"
                                class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors">

                                <td class="co-td text-[13px] font-semibold text-[#1F2533]">{{ category.name }}</td>
                                <td class="co-td text-[13px] text-[#5C6478]">{{ category.slug }}</td>
                                <td class="co-td text-[13px] text-[#5C6478]">{{ category.icon || '—' }}</td>
                                <td class="co-td text-[13px] text-[#5C6478]">{{ category.sort_order }}</td>
                                <td class="co-td">
                                    <span v-if="category.is_active !== false"
                                        class="co-badge co-badge-green text-[10px]">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span>
                                        {{ $t('superadmin.appCategories.active') }}
                                    </span>
                                    <span v-else class="co-badge co-badge-gray text-[10px]">
                                        {{ $t('superadmin.appCategories.inactive') }}
                                    </span>
                                </td>
                                <td class="co-td text-[13px] text-[#5C6478]">{{ category.applications_count ?? 0 }}</td>

                                <td class="co-td">
                                    <div class="flex items-center gap-2 justify-end">
                                        <button class="co-action-btn" @click="openEdit(category)">
                                            <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                            {{ $t('superadmin.appCategories.edit') }}
                                        </button>
                                        <button class="co-action-btn-danger" @click="confirmDelete(category)">
                                            <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                            {{ $t('delete') }}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <Pagination :data="state.categories" @previous="previous" @next="next" />
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

const filteredCategories = computed(() => state.categories?.data ?? [])

onMounted(() => {
    fetchCategories()
})

async function fetchCategories() {
    state.isLoading = true
    try {
        const params: any = { page: currentTablePage, ...state.dataFilter }
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
    color: #8891A4;
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
    color: #5C6478;
    border: 1px solid #D5D9E2;
    transition: all 0.15s;
    cursor: pointer
}

.co-action-btn:hover {
    background: #F5F6F8;
    color: #205E77;
    border-color: #205E77
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
    color: #CC3B2D;
    border: 1px solid #F5C6C3;
    transition: all 0.15s;
    cursor: pointer
}

.co-action-btn-danger:hover {
    background: #FEF2F2;
    border-color: #CC3B2D
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
    background: #EDF7EE;
    color: #2E9E33
}

.co-badge-gray {
    background: #F5F6F8;
    color: #5C6478
}
</style>
