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
                <NuxtLink
                    class="inline-flex items-center gap-1.5 mb-4 text-sm text-gray-500 hover:text-primary transition-colors max-w-fit"
                    to="/schedules/draft">
                    <Icon name="ph:arrow-left" size="16" />
                    <span>{{ $t('dutySchedules.draftTemplates.backToDraft') }}</span>
                </NuxtLink>
                <!-- Forklaringsboks -->
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 mb-5">
                    <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <div>
                        <p class="text-sm font-semibold text-blue-900 mb-1">{{ $t('dutySchedules.draftTemplates.infoBox.title') }}</p>
                        <p class="text-sm text-blue-700 mb-2">{{ $t('dutySchedules.draftTemplates.infoBox.description') }}</p>
                        <div class="flex flex-col gap-1.5 text-xs text-blue-700">
                            <div class="flex items-start gap-2">
                                <span class="font-semibold text-blue-800 shrink-0">📅 {{ $t('dutySchedules.draftTemplates.infoBox.oneTime') }}</span>
                                <span>{{ $t('dutySchedules.draftTemplates.infoBox.oneTimeDescription') }}</span>
                            </div>
                            <div class="flex items-start gap-2">
                                <span class="font-semibold text-blue-800 shrink-0">🔄 {{ $t('dutySchedules.draftTemplates.infoBox.recurring') }}</span>
                                <span>{{ $t('dutySchedules.draftTemplates.infoBox.recurringDescription') }}</span>
                            </div>
                        </div>
                        <p class="text-xs text-blue-600 mt-2">💡 {{ $t('dutySchedules.draftTemplates.infoBox.tip') }}</p>
                    </div>
                </div>
                <div class="flex-none lg:flex justify-between items-center gap-3 space-y-3 mb-5">
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
                        <button onclick="document.getElementById('help-guide-modal').style.display='flex'"
                            class="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-500 text-xs font-semibold transition-all shadow-sm flex-shrink-0">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {{ $t('helpGuide.title') }}
                        </button>
                        <!-- Help Modal -->
                        <div id="help-guide-modal"
                            style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(15,43,70,0.6);backdrop-filter:blur(4px);align-items:center;justify-content:center;"
                            onclick="if(event.target===this)this.style.display='none'">
                            <div
                                style="background:white;border-radius:20px;width:90vw;max-width:1100px;height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 25px 80px rgba(0,0,0,0.35);">
                                <div
                                    style="display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #e2e8f0;flex-shrink:0;">
                                    <div style="display:flex;align-items:center;gap:10px;">
                                        <svg style="width:20px;height:20px;color:#0f4c75" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <span style="font-weight:600;color:#0f2b46;font-size:15px;">{{
                                            $t('helpGuide.scheduleTitle')
                                        }}</span>
                                    </div>
                                    <button onclick="document.getElementById('help-guide-modal').style.display='none'"
                                        style="padding:8px;border-radius:8px;border:none;background:#f1f5f9;cursor:pointer;display:flex;align-items:center;color:#64748b;"
                                        :title="$t('dutySchedules.draftTemplates.close')">
                                        <svg style="width:18px;height:18px" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <iframe src="/vagtplan-guide.html" style="flex:1;border:none;width:100%;"
                                    :title="$t('helpGuide.title')"></iframe>
                            </div>
                        </div>
                        <FormButton @click="state.modal.isNewTemplateModalOpen = true" buttonStyle="action">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('dutySchedules.draftTemplates.newDraft') }}
                        </FormButton>
                        <FormButton v-if="state.selectedTemplates?.length"
                            @click="state.modal.isApplyTemplateModalOpen = true" buttonStyle="action">
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
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="navigateTo(`/schedules/draft/templates/${draftTemplate.uuid}/view-details`)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>

                                            <Tooltip :text="$t('dutySchedules.draftTemplates.table.actions.edit')">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="editDraftTemplate(draftTemplate)">
                                                    <Icon name="ph:pencil" class="size-4" />
                                                </FormButton>
                                            </Tooltip>

                                            <Tooltip :text="$t('dutySchedules.draftTemplates.table.actions.delete')">
                                                <FormButton type="button" buttonStyle="danger"
                                                    @click="confirmTemplateRemoval(draftTemplate)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>

                                            <Tooltip :text="$t('dutySchedules.draftTemplates.table.actions.apply')">
                                                <FormButton type="button" buttonStyle="action"
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
            page: draftTemplateStore.getCurrentPageNumber,
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
