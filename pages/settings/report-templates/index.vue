<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('reportTemplates.reportTemplates') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('reportTemplates.reportTemplates') }}</template>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <div class="flex justify-between items-center mb-2">
                        <button
                            class="flex items-center gap-1.5 outline-none rounded-md text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 text-gray-600"
                            @click="state.modal.isFilterOpen = true">
                            <Icon name="ic:outline-filter-list" class="h-4 w-4" />
                            {{ $t('filter') }}
                            <span v-if="activeFilterCount > 0"
                                class="ml-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">
                                {{ activeFilterCount }}
                            </span>
                        </button>
                        <FormButton buttonStyle="action" @click="navigateTo('/settings/report-templates/new')">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('reportTemplates.newReportTemplate') }}
                        </FormButton>
                    </div>
                    <TableSearch @search="handleSearch" />

                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.templates"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.templates?.data?.length === 0))">
                                <tr v-for="(template, index) in state.templates?.data" :key="index">
                                    <td width="35%">
                                        <span>{{ template?.name }}</span>
                                    </td>
                                    <td width="30%">
                                        <span>{{ template?.case_type?.name ?? '-' }}</span>
                                    </td>
                                    <td width="15%">
                                        <Badge :type="template?.is_active ? 'active' : 'inactive'" class="w-fit">
                                            {{ template?.is_active ? $t('reportTemplates.table.active') : $t('reportTemplates.table.inactive') }}
                                        </Badge>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/report-templates/${template.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('reportTemplates.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="openDeleteConfirmation(template)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('reportTemplates.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.templates" @previous="previous" @next="next" />
                </div>
            </div>

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('reportTemplates.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isDeleteOpen = false"
                @confirm="deleteTemplate" />

            <Modal size="sm" :title="$t('filter')" :show="state.modal.isFilterOpen"
                @close="state.modal.isFilterOpen = false">
                <template #modal-body>
                    <form @submit.prevent="applyFilter()">
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="filter_case_type_uuid"
                                    :label="$t('reportTemplates.form.agreementType')" />
                                <FormSelect id="filter_case_type_uuid" name="filter_case_type_uuid"
                                    :options="state.options.caseTypes"
                                    v-model="state.filterForm.case_type_uuid" />
                            </div>
                            <div class="flex items-center gap-2 cursor-pointer pt-1"
                                @click="state.filterForm.is_active = !state.filterForm.is_active">
                                <FormCheckbox :value="state.filterForm.is_active" />
                                <span class="text-sm text-gray-700">{{ $t('reportTemplates.form.isActive') }}</span>
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel"
                                    @click="state.modal.isFilterOpen = false">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary">
                                    {{ $t('filter') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { reportTemplateService } from '@/components/api/user/ReportTemplateService'
import { employmentService } from '@/components/api/user/EmploymentService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const breadcrumbLinks = [
    { name: 'reportTemplates.reportTemplates', translate: true, href: '/settings/report-templates' },
]

const state = reactive({
    columnHeaders: [
        { name: 'reportTemplates.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'reportTemplates.table.agreementType', isTranslateName: true, sorter: false, key: 'case_type_uuid' },
        { name: 'reportTemplates.table.isActive', isTranslateName: true, sorter: false, key: 'is_active' },
        { name: '' },
    ],
    options: {
        caseTypes: [] as any[],
    },
    dataFilter: {
        search: [] as any,
        case_type_uuid: '',
        is_active: false,
    },
    filterForm: {
        case_type_uuid: '',
        is_active: false,
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteOpen: false,
        isFilterOpen: false,
    },
    selectedTemplate: null as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    templates: [] as any,
})

const activeFilterCount = computed(() => {
    let count = 0
    if (state.dataFilter.case_type_uuid) count++
    if (state.dataFilter.is_active) count++
    return count
})

onMounted(() => {
    fetchTemplates()
    fetchCaseTypes()
})

watch(() => state.modal.isFilterOpen, (isOpen: boolean) => {
    if (isOpen) {
        state.filterForm.case_type_uuid = state.dataFilter.case_type_uuid
        state.filterForm.is_active = state.dataFilter.is_active
    }
})

async function fetchTemplates() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params: any = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        if (state.dataFilter.search?.length) params.search = state.dataFilter.search
        if (state.dataFilter.case_type_uuid) params.case_type_uuid = state.dataFilter.case_type_uuid
        if (state.dataFilter.is_active) params.is_active = state.dataFilter.is_active
        const response = await reportTemplateService.getReportTemplates(params)
        if (response) {
            state.templates = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchTemplates()
}

function applyFilter() {
    state.dataFilter.case_type_uuid = state.filterForm.case_type_uuid
    state.dataFilter.is_active = state.filterForm.is_active
    state.modal.isFilterOpen = false
    currentTablePage = 1
    fetchTemplates()
}

function previous() {
    currentTablePage--
    fetchTemplates()
}

function next() {
    currentTablePage++
    fetchTemplates()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = { sortField: sortingData.column, sortOrder: sortingData.sort }
    fetchTemplates()
}

function openDeleteConfirmation(template: any) {
    state.selectedTemplate = template
    state.modal.isDeleteOpen = true
}

async function deleteTemplate() {
    state.error = {}
    state.isTableLoading = true
    try {
        await reportTemplateService.deleteReportTemplate(state.selectedTemplate.uuid)
        successAlert(`${t('alert.success')}!`, `${t('reportTemplates.alert.templateSuccessfullyDeleted')}.`)
        state.modal.isDeleteOpen = false
        fetchTemplates()
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function fetchCaseTypes() {
    try {
        const response = await employmentService.getAllCaseTypes()
        if (response?.data) {
            state.options.caseTypes = [
                { value: '', label: t('all') },
                ...response.data.map((c: any) => ({ value: c.uuid, label: c.name })),
            ]
        }
    } catch {}
}
</script>
