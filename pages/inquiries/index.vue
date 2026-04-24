<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('inquiries.inquiries') }}
                    -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('inquiries.inquiries') }}
            </template>

            <div>
                <div class="flex justify-between items-center mb-5">
                    <div class="flex items-center gap-x-1">
                        <span>{{ $t('entriesPerPage') }}:</span>
                        <select class="focus:outline-none bg-transparent" @change="changePageLength"
                            id="inquiriesPageLength">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="40">40</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="500">500</option>
                        </select>
                    </div>
                    <div class="flex items-center gap-x-3">
                        <Menu as="div" class="relative inline-block text-left z-20">
                            <div>
                                <MenuButton>
                                    <FormButton buttonStyle="action">
                                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('inquiries.newInquiry') }}
                                    </FormButton>
                                </MenuButton>
                            </div>

                            <transition enter-active-class="transition duration-100 ease-out"
                                enter-from-class="transform scale-95 opacity-0"
                                enter-to-class="transform scale-100 opacity-100"
                                leave-active-class="transition duration-75 ease-in"
                                leave-from-class="transform scale-100 opacity-100"
                                leave-to-class="transform scale-95 opacity-0">
                                <MenuItems
                                    class="absolute right-0 mt-2 min-w-44 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                                    <div class="px-1 py-1">
                                        <MenuItem v-slot="{ active }">
                                        <button :class="[
                                            active && 'bg-gray-100',
                                            'group flex w-full justify-start items-center rounded-md px-2 py-2.5 text-sm text-left',
                                        ]" @click="shelterNewInquiry">
                                            {{ shelterName }}
                                        </button>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }">
                                        <button :class="[
                                            active && 'bg-gray-100',
                                            'group flex w-full items-center rounded-md px-2 py-2.5 text-sm',
                                        ]" @click="crisisCenterNewInquiry">
                                            {{ crisisCenterName }}
                                        </button>
                                        </MenuItem>
                                    </div>
                                </MenuItems>
                            </transition>
                        </Menu>

                        <Menu as="div" class="relative inline-block text-left z-20">
                            <div>
                                <MenuButton>
                                    <FormButton buttonStyle="action">
                                        <Icon name="ph:file-arrow-down" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('inquiries.exportInquiries') }}
                                    </FormButton>
                                </MenuButton>
                            </div>

                            <transition enter-active-class="transition duration-100 ease-out"
                                enter-from-class="transform scale-95 opacity-0"
                                enter-to-class="transform scale-100 opacity-100"
                                leave-active-class="transition duration-75 ease-in"
                                leave-from-class="transform scale-100 opacity-100"
                                leave-to-class="transform scale-95 opacity-0">
                                <MenuItems
                                    class="absolute right-0 mt-2 min-w-44 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                                    <div class="px-1 py-1">
                                        <MenuItem v-slot="{ active }">
                                        <button :class="[active && 'bg-gray-100', 'group flex w-full justify-start items-center rounded-md px-2 py-2.5 text-sm text-left']"
                                            @click="openExportModal('shelter')">
                                            {{ shelterName }}
                                        </button>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }">
                                        <button :class="[active && 'bg-gray-100', 'group flex w-full justify-start items-center rounded-md px-2 py-2.5 text-sm text-left']"
                                            @click="openExportModal('crisis_center')">
                                            {{ crisisCenterName }}
                                        </button>
                                        </MenuItem>
                                    </div>
                                </MenuItems>
                            </transition>
                        </Menu>
                    </div>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.inquiries"
                            :isLoading="state.isTableLoading" :sortData="inquiryStore.getSortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.inquiries?.data?.length === 0))">
                                <tr v-for="(inquiry, index) in state.inquiries?.data" :key="index">
                                    <td width="15%">
                                        {{ formatDateToReadable(inquiry?.inquiry_date) }}
                                    </td>
                                    <td width="15%">
                                        <Badge :type="inquiry?.citizen_id ? 'active' : 'primary'" class="w-fit">
                                            <p class="text-xxs truncate">
                                                {{ inquiry?.citizen_id ?
                                                    $t('inquiries.table.status.convertedAsCitizen') :
                                                    $t('inquiries.table.status.forConversion') }}
                                            </p>
                                        </Badge>
                                    </td>
                                    <td width="15%">
                                        <span>{{ inquiry?.inquirer_name }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ inquiry?.firstname }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ inquiry?.lastname }}</span>
                                    </td>
                                    <td width="10%">
                                        <div class="flex flex-wrap gap-1">
                                            <span v-for="(dept, di) in inquiry?.departments" :key="di"
                                                class="bg-primary px-2 py-1 text-white text-xxs rounded-md">
                                                {{ dept?.name }}
                                            </span>
                                        </div>
                                    </td>
                                    <td width="10%">
                                        <span>{{ inquiry?.outcome }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ inquiry?.purpose }}</span>
                                    </td>
                                    <td width="15%">
                                        <span>{{ inquiry?.conversation_summary }}</span>
                                    </td>
                                    <td width="10%">
                                        <div class="flex items-end justify-end gap-2">
                                            <Tooltip :text="$t('inquiries.table.actions.edit')">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="editInquiry(inquiry)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('inquiries.table.actions.convertAsCitizen')"
                                                v-if="!inquiry?.citizen_id">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="convertInquiryConfirmation(inquiry)">
                                                    <Icon name="ph:check" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('inquiries.table.actions.delete')">
                                                <FormButton type="button" buttonStyle="danger"
                                                    @click="deleteConfirmation(inquiry)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.inquiries" @previous="previous" @next="next" />
                </div>
            </div>

            <ModulesUserInquiryModalNew :isModalOpen="state.modal.isAddInquiryOpen" :inquiry-type="state.inquiryTpe"
                @close="state.modal.isAddInquiryOpen = false" @refreshInquiries="fetchInquiries" />
            <ModulesUserInquiryModalEdit :isModalOpen="state.modal.isEditInquiryOpen"
                :selectedInquiry="state.selectedInquiry" @close="state.modal.isEditInquiryOpen = false"
                @refreshInquiries="fetchInquiries" />

            <DialogConfirmation :isModalOpen="state.modal.isConvertInquiryOpen"
                :message="$t('inquiries.table.confirmation.convertAsCitizenConfirmation') + '?'"
                @close="state.modal.isConvertInquiryOpen = false" @confirm="convertInquiry" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteInquiryOpen"
                :message="$t('inquiries.table.confirmation.deleteInquiryConfirmation') + '?'"
                @close="state.modal.isDeleteInquiryOpen = false" @confirm="deleteInquiry" />

            <Modal size="xs" :title="exportModalTitle" :show="state.modal.isExportDepartmentOpen"
                @close="state.modal.isExportDepartmentOpen = false">
                <template #modal-body>
                    <div class="space-y-4">
                        <div class="space-y-1">
                            <FormLabel :label="customPagesStore.getCustomPagesName?.department || $t('department.department')" />
                            <FormSelect :options="exportDepartmentOptions" v-model="state.selectedExportDepartmentUuid" />
                        </div>
                        <div class="grid grid-cols-2 gap-3 pb-6">
                            <FormButton buttonStyle="cancel" @click="state.modal.isExportDepartmentOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton buttonStyle="primary" @click="confirmExport">
                                {{ $t('inquiries.exportInquiries') }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { citizenInquiryService } from '@/components/api/user/CitizenInquiryService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useInquiryStore } from '@/store/inquiry'
import { useDepartmentStore } from '@/store/department'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'
import { useCustomPagesStore } from '@/store/custom-pages'

const runtimeConfig = useRuntimeConfig()
const inquiryStore = useInquiryStore() as any
const departmentStore = useDepartmentStore()
const { formatDateToReadable } = useDatetimeFormatter()
const customPagesStore = useCustomPagesStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const shelterName = computed(() => customPagesStore.getCustomPagesName?.shelter || t('inquiries.form.options.inquiryType.shelter'))
const crisisCenterName = computed(() => customPagesStore.getCustomPagesName?.crisisCenter || t('inquiries.form.options.inquiryType.crisisCenter'))

const exportModalTitle = computed(() => state.exportInquiryType === 'shelter' ? shelterName.value : crisisCenterName.value)
const exportDepartmentOptions = computed(() => [
    { value: '', label: t('department.allDepartment') },
    ...state.departments.map((d: any) => ({ value: d.uuid, label: d.name })),
])

const breadcrumbLinks = [
    {
        name: 'inquiries.inquiries',
        translate: true,
        href: `/inquiries`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'inquiries.table.dateOfInquiry', isTranslateName: true, sorter: true, key: 'inquiry_date' },
        { name: 'inquiries.table.status.status', isTranslateName: true, sorter: true, key: 'citizen_id' },
        { name: 'inquiries.table.inquirerName', isTranslateName: true, sorter: true, key: 'inquirer_name' },
        { name: 'inquiries.table.firstname', isTranslateName: true, sorter: true, key: 'firstname' },
        { name: 'inquiries.table.lastname', isTranslateName: true, sorter: true, key: 'lastname' },
        { name: 'department.department', isTranslateName: true, },
        { name: 'inquiries.table.outcome', isTranslateName: true, },
        { name: 'inquiries.table.purpose', isTranslateName: true, },
        { name: 'inquiries.table.conversationSummary', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    departments: [] as any,
    error: {} as Error,
    isTableLoading: false,
    inquiries: [] as any,
    modal: {
        isAddInquiryOpen: false,
        isConvertInquiryOpen: false,
        isEditInquiryOpen: false,
        isDeleteInquiryOpen: false,
        isExportDepartmentOpen: false,
    },
    selectedInquiry: {} as any,
    inquiryTpe: '',
    exportInquiryType: '',
    selectedExportDepartmentUuid: '',
})

onMounted(() => {
    fetchDepartments()
    fetchInquiries()
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchInquiries()
    }
})

async function fetchInquiries() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
            page: inquiryStore.getCurrentPageNumber,
            page_length: inquiryStore.getCurrentPageLength,
            sortField: inquiryStore.getSortData.sortField,
            sortOrder: inquiryStore.getSortData.sortOrder,
            ...state.dataFilter
        }
        const response = await citizenInquiryService.getInquiries(params)
        if (response) {
            state.inquiries = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    const currentTablePage = inquiryStore.getCurrentPageNumber - 1
    inquiryStore.setCurrentPageNumber(currentTablePage)
    fetchInquiries()
}

function next() {
    const currentTablePage = inquiryStore.getCurrentPageNumber + 1
    inquiryStore.setCurrentPageNumber(currentTablePage)
    fetchInquiries()
}

function sort(sortingData: any) {
    inquiryStore.setCurrentPageNumber(1)
    const sortField = sortingData.column
    const sortOrder = sortingData.sort
    inquiryStore.setSortData(sortField, sortOrder)
    fetchInquiries()
}

function handleSearch(value: any) {
    inquiryStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchInquiries()
}

function changePageLength(event: any) {
    inquiryStore.setCurrentPageNumber(1)
    inquiryStore.setCurrentPageLength(event.target.value)
    fetchInquiries()
}

function editInquiry(inquiry: any) {
    state.selectedInquiry = inquiry
    state.modal.isEditInquiryOpen = true
}

function convertInquiryConfirmation(inquiry: any) {
    state.selectedInquiry = inquiry
    state.modal.isConvertInquiryOpen = true
}

async function convertInquiry() {
    state.error = {}
    state.isTableLoading = true
    try {
        const inquiryUuid = state.selectedInquiry?.uuid
        const response = await citizenInquiryService.convertInquiry(inquiryUuid)
        if (response) {
            fetchInquiries()
            successAlert(`${t('alert.success')}!`, `${t('inquiries.table.alert.participantSuccessfullyConvertedAsCitizen')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function shelterNewInquiry() {
    state.inquiryTpe = 'shelter'
    state.modal.isAddInquiryOpen = true
}

function crisisCenterNewInquiry() {
    state.inquiryTpe = 'crisis_center'
    state.modal.isAddInquiryOpen = true
}

function deleteConfirmation(inquiry: any) {
    state.selectedInquiry = inquiry
    state.modal.isDeleteInquiryOpen = true
}

async function deleteInquiry() {
    state.error = {}
    state.isTableLoading = true
    try {
        const inquiryUuid = state.selectedInquiry?.uuid
        const response = await citizenInquiryService.deleteInquiry(inquiryUuid)
        if (response) {
            fetchInquiries()
            successAlert(`${t('alert.success')}!`, `${t('inquiries.table.alert.inquirySuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function fetchDepartments() {
    try {
        const response = await departmentService.getAllDepartments({})
        if (response) {
            state.departments = response.data
        }
    } catch (error: any) {
        state.error = error
    }
}

function openExportModal(inquiryType: string) {
    state.exportInquiryType = inquiryType
    state.selectedExportDepartmentUuid = ''
    state.modal.isExportDepartmentOpen = true
}

async function confirmExport() {
    const dept = state.departments.find((d: any) => d.uuid === state.selectedExportDepartmentUuid)
    await exportInquiries({
        inquiry_type: state.exportInquiryType,
        department: dept?.name,
        department_uuid: dept?.uuid,
    })
    state.modal.isExportDepartmentOpen = false
}

async function exportInquiries(params: { inquiry_type: string, department?: string, department_uuid?: string }) {
    state.error = {}
    state.isTableLoading = true
    try {
        const queryParams = {
            inquiry_type: params.inquiry_type,
            department: params.department ?? departmentStore.getSelectedDepartmentName,
            department_uuid: params.department_uuid ?? departmentStore.getSelectedDepartment,
        }
        const response = await citizenInquiryService.exportInquiries(queryParams)
        if (response) {
            let fileName = params.inquiry_type === 'shelter' ? t('inquiries.shelterInquiry') : t('inquiries.crisisCenterInquiry')
            saveAs(response, `${customPagesStore.getCustomPagesName?.citizens}-${fileName}`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>