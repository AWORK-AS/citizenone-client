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
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="state.modal.isNewInquiryOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('inquiries.newInquiry') }}
                        </FormButton>
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
                                        {{ inquiry?.inquiry_date }}
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
                                        <span>{{ inquiry?.outcome }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ inquiry?.purpose }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ inquiry?.conversation_summary }}</span>
                                    </td>
                                    <td width="10%">
                                        <div class="flex items-end justify-end gap-2">
                                            <Tooltip :text="$t('inquiries.table.actions.edit')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="editInquiry(inquiry)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('inquiries.table.actions.delete')">
                                                <FormButton type="button" buttonStyle="danger" class="rounded-md"
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

            <DialogConfirmation :isModalOpen="state.modal.isDeleteInquiryOpen"
                :message="$t('inquiries.table.deleteInquiryConfirmation') + '?'"
                @close="state.modal.isDeleteInquiryOpen = false" @confirm="deleteInquiry" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenInquiryService } from '@/components/api/user/CitizenInquiryService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useInquiryStore } from '@/store/inquiry'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const inquiryStore = useInquiryStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    {
        name: 'inquiries.inquiries',
        translate: true,
        href: `/inquiries`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'inquiries.table.dateOfInquiry', sorter: true, key: 'inquiry_date' },
        { name: 'inquiries.table.inquirerName', sorter: true, key: 'inquirer_name' },
        { name: 'inquiries.table.firstname', sorter: true, key: 'firstname' },
        { name: 'inquiries.table.lastname', sorter: true, key: 'lastname' },
        { name: 'inquiries.table.outcome' },
        { name: 'inquiries.table.purpose' },
        { name: 'inquiries.table.conversationSummary' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    inquiries: [] as any,
    modal: {
        isEditInquiryOpen: false,
        isNewInquiryOpen: false,
        isDeleteInquiryOpen: false,
    },
    selectedInquiry: {} as any,
})

onMounted(() => {
    fetchInquiries()
})

async function fetchInquiries() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
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
            successAlert(`${t('alert.success')}!`, `${t('citizens.inquiry.form.alert.inquirySuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>