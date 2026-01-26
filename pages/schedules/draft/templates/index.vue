<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                    {{ $t("dutySchedules.draftTemplates.draftTemplates")?.toLowerCase() }}
                    -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb>
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/schedules')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                            </button>
                        </div>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/schedules/draft')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ $t('dutySchedules.draft.pageTitle') }}
                            </button>
                        </div>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/schedules/draft/templates')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                <span>
                                    {{ $t('dutySchedules.draftTemplates.draftTemplates') }}
                                </span>
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('dutySchedules.draftTemplates.draftTemplates') }} - {{
                departmentStore.getSelectedDepartmentName }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/schedules/draft">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <div class="flex-none lg:flex justify-between items-center space-y-3 mb-5">
                    <div class="flex items-center gap-x-1">
                        <span>{{ $t('entriesPerPage') }}:</span>
                        <select class="focus:outline-none bg-transparent" @change="changePageLength"
                            id="employeesPageLength">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="40">40</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="500">500</option>
                        </select>
                    </div>
                    <div class="flex flex-wrap items-center gap-3">
                        <FormButton @click="state.modal.isNewTemplateModalOpen = true" buttonStyle="action"
                            class="rounded-lg">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('dutySchedules.draftTemplates.newDraft') }}
                        </FormButton>
                        <FormButton v-if="state.selectedTemplates?.length"
                            @click="state.modal.isApplyTemplateModalOpen = true" buttonStyle="action"
                            class="rounded-lg">
                            <Icon name="ph:check" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('dutySchedules.draftTemplates.table.actions.applySelected') }}
                        </FormButton>
                    </div>
                </div>

                <div class="space-y-5">
                    <TableSearch @search="handleSearch" />

                    <div class="table-responsive">
                        <Table :data="state.draftTemplates" :columnHeaders="state.columnHeaders"
                            :isLoading="state.isTableLoading" :sortData="draftTemplateStore.getSortData" @sort="sort"
                            :selection="true" rowKey="uuid" @selection-change="handleRowSelect">
                            <template #body="{ selectedRows, handleRowSelect }"
                                v-if="!(state.isTableLoading || (state.draftTemplates?.data?.length === 0))">
                                <tr v-for="draftTemplate in state.draftTemplates.data" :key="draftTemplate.uuid"
                                    class="hover:bg-gray-50">
                                    <td>
                                        <label class="inline-flex items-center cursor-pointer relative">
                                            <input type="checkbox"
                                                :checked="selectedRows.some(r => r.uuid === draftTemplate.uuid)"
                                                @change="handleRowSelect(draftTemplate)"
                                                class="peer w-5 h-5 appearance-none border border-primary rounded-sm checked:bg-secondary checked:border-secondary focus: ring-0 cursor-pointer" />
                                            <span
                                                class="pointer-events-none absolute top-0 left-0 w-5 h-5 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                                                <Icon name="ph:check-bold" class="h-4 w-4 text-white" />
                                            </span>
                                        </label>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {{ draftTemplate.name }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span v-if="draftTemplate.is_recurring">
                                            {{ $t('dutySchedules.draftTemplates.table.recurring') }}
                                        </span>
                                        <span v-else>
                                            {{ $t('dutySchedules.draftTemplates.table.nonRecurring') }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div class="text-xxs flex flex-wrap gap-1">
                                            <span v-for="(department, index) in draftTemplate?.departments" :key=index
                                                class=" px-2 py-1 text-white rounded-md"
                                                :style="{ backgroundColor: department?.color }">
                                                {{ department?.name }}
                                            </span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span>
                                            {{ draftTemplate.week_rotations ? draftTemplate.week_rotations : 1 }}
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <Tooltip :text="$t('dutySchedules.draftTemplates.table.actions.view')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="navigateTo(`/schedules/draft/templates/${draftTemplate.uuid}/view-details`)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>

                                            <Tooltip :text="$t('dutySchedules.draftTemplates.table.actions.edit')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="editDraftTemplate(draftTemplate)">
                                                    <Icon name="ph:pencil" class="size-4" />
                                                </FormButton>
                                            </Tooltip>

                                            <Tooltip :text="$t('dutySchedules.draftTemplates.table.actions.delete')">
                                                <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                    @click="confirmTemplateRemoval(draftTemplate)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>

                                            <Tooltip :text="$t('dutySchedules.draftTemplates.table.actions.apply')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="applyDraftTemplate(draftTemplate)">
                                                    <Icon name="ph:check" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.draftTemplates" @previous="previous" @next="next" />
                </div>
            </div>

            <!-- Additional modals and components can be added here -->
            <ModulesUserDutyScheduleDraftTemplatesModalNewTemplate :isModalOpen="state.modal.isNewTemplateModalOpen"
                @refresh-draft-templates="fetchDraftTemplates" @close="state.modal.isNewTemplateModalOpen = false" />

            <ModulesUserDutyScheduleDraftTemplatesModalEditTemplate :isModalOpen="state.modal.isEditTemplateModalOpen"
                :selectedDraftTemplate="state.selectedDraftTemplate" @refresh-draft-templates="fetchDraftTemplates"
                @close="state.modal.isEditTemplateModalOpen = false" />

            <ModulesUserDutyScheduleDraftTemplatesModalApplyTemplate :isModalOpen="state.modal.isApplyTemplateModalOpen"
                :selectedDraftTemplate="state.selectedDraftTemplate" :selectedTemplates="state.selectedTemplates"
                @refresh-draft-templates="fetchDraftTemplates" @close="state.modal.isApplyTemplateModalOpen = false" />

            <DialogConfirmation :isModalOpen="state.modal.isRemoveTemplateOpen"
                :message="$t('dutySchedules.draftTemplates.table.confirmation.deleteDraftTemplateConfirmation') + '?'"
                @close="state.modal.isRemoveTemplateOpen = false" @confirm="removeTemplate" />

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { draftTemplateService } from '@/components/api/user/DraftTemplateService'
import { useCustomPagesStore } from "@/store/custom-pages";
import { useDraftTemplateStore } from '@/store/draft-template';
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'
import { useDepartmentStore } from '@/store/department';

const runtimeConfig = useRuntimeConfig();
const customPagesStore = useCustomPagesStore() as any;
const draftTemplateStore = useDraftTemplateStore();
const departmentStore = useDepartmentStore() as any;
const { t } = useI18n()
const { successAlert } = useAlert()

const state = reactive({
    columnHeaders: [
        { name: 'dutySchedules.draftTemplates.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'dutySchedules.draftTemplates.table.recurring', isTranslateName: true, sorter: true, key: 'is_recurring' },
        { name: 'dutySchedules.draftTemplates.table.departments', isTranslateName: true, sorter: true, key: 'departments' },
        { name: 'dutySchedules.draftTemplates.table.weekRotations', isTranslateName: true, sorter: false, key: 'week_rotations' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    draftTemplates: [] as any,
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isNewTemplateModalOpen: false,
        isEditTemplateModalOpen: false,
        isApplyTemplateModalOpen: false,
        isRemoveTemplateOpen: false,
    },
    selectedDraftTemplate: {} as any,
    selectedTemplates: [] as string[],
});

onMounted(() => {
    fetchDraftTemplates()
})

watch(() => departmentStore.getSelectedDepartmentName, () => {
    fetchDraftTemplates()
})

async function fetchDraftTemplates() {
    state.error = {}
    state.isTableLoading = true
    let selectedDepartment = departmentStore.getSelectedDepartmentName
    if (selectedDepartment === 'All departments' || selectedDepartment === 'Alle afdelinger') {
        selectedDepartment = 'all-departments'
    }
    try {
        const params = {
            page_length: draftTemplateStore.getCurrentPageLength,
            page_number: draftTemplateStore.getCurrentPageNumber,
            sort_field: draftTemplateStore.getSortData.sortField,
            sort_order: draftTemplateStore.getSortData.sortOrder,
            department: selectedDepartment,
            ...state.dataFilter
        }
        const response = await draftTemplateService.getDraftTemplates(params)
        if (response?.data) {
            state.draftTemplates = response
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isTableLoading = false
    }
}

function previous() {
    const currentTablePage = draftTemplateStore.getCurrentPageNumber - 1
    draftTemplateStore.setCurrentPageNumber(currentTablePage)
    fetchDraftTemplates()
}

function next() {
    const currentTablePage = draftTemplateStore.getCurrentPageNumber + 1
    draftTemplateStore.setCurrentPageNumber(currentTablePage)
    fetchDraftTemplates()
}

function sort(sortingData: any) {
    draftTemplateStore.setCurrentPageNumber(1)
    const sortField = sortingData.column
    const sortOrder = sortingData.sort
    draftTemplateStore.setSortData(sortField, sortOrder)
    fetchDraftTemplates()
}

function handleSearch(value: any) {
    draftTemplateStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchDraftTemplates()
}

function changePageLength(event: any) {
    draftTemplateStore.setCurrentPageNumber(1)
    draftTemplateStore.setCurrentPageLength(event.target.value)
    fetchDraftTemplates()
}

function handleRowSelect(selectedRows: any) {
    state.selectedTemplates = selectedRows
}

function editDraftTemplate(draftTemplate: any) {
    state.selectedDraftTemplate = draftTemplate
    state.modal.isEditTemplateModalOpen = true
}

function applyDraftTemplate(draftTemplate: any) {
    // state.selectedDraftTemplate = draftTemplate
    state.selectedTemplates = [draftTemplate]
    state.modal.isApplyTemplateModalOpen = true
}

function confirmTemplateRemoval(template: any) {
    state.selectedDraftTemplate = template
    state.modal.isRemoveTemplateOpen = true
}

async function removeTemplate() {
    state.error = {}
    state.isTableLoading = true
    try {
        const draftTemplateUuid = state.selectedDraftTemplate.uuid
        const response = await draftTemplateService.deleteDraftTemplate(draftTemplateUuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.draftTemplates.table.alert.draftTemplateSuccessfullyDeleted')}.`)
            fetchDraftTemplates()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
