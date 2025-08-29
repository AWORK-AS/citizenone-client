<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ customPagesStore.getCustomPagesName?.citizens }}
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
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>
                {{ customPagesStore.getCustomPagesName?.citizens }}
            </template>
            <template #guided-tour>
                <Tooltip :text="$t('guidedTour')" @click="openGuidedTour()">
                    <Icon name="ph:question" class="size-6 cursor-pointer text-gray-700" aria-hidden="true" />
                </Tooltip>
            </template>

            <div>
                <div class="flex justify-between items-center mb-5"
                    v-if="userStore.getUser?.roles?.[0]?.name === 'Admin'">
                    <div class="flex items-center gap-x-1">
                        <span>{{ $t('entriesPerPage') }}:</span>
                        <select class="focus:outline-none bg-transparent" @change="changePageLength"
                            id="citizensPageLength">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="40">40</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="500">500</option>
                        </select>
                    </div>
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/citizens/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizens.newCitizen') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.citizens"
                            :isLoading="state.isTableLoading" :sortData="citizenStore.getSortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.citizens?.data?.length === 0))">
                                <tr v-for="(citizen, index) in state.citizens?.data" :key="index">
                                    <td width="30%">
                                        <div class="flex items-center gap-x-2">
                                            <img :src="citizen?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${citizen?.firstname + ' ' + citizen?.lastname}`"
                                                :class="[
                                                    citizen.latest_risk_assessment === null && 'border-secondary',
                                                    citizen.latest_risk_assessment?.assessment === 'no risk' && 'border-green-700',
                                                    citizen.latest_risk_assessment?.assessment === 'increased risk' && 'border-yellow-500',
                                                    citizen.latest_risk_assessment?.assessment === 'acute increased risk' && 'border-red-600',
                                                    'rounded-full w-12 h-12 object-cover border-2'
                                                ]" />
                                            <div>
                                                <span>{{ citizen?.firstname }} {{ citizen?.lastname }}</span>
                                                <div class="text-xxs flex flex-wrap gap-1">
                                                    <span v-for="(department, index) in citizen?.departments" :key=index
                                                        class="bg-primary px-2 py-1 text-white rounded-md">
                                                        {{ department?.name }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <p v-if="citizen?.email">{{ citizen?.email }}</p>
                                        <p v-else class="text-primary hover:text-primary-hover cursor-pointer"
                                            @click="state.modal.showPurchaseEmail = true">
                                            {{ $t('citizens.purchaseEmail.purchaseEmail') }}
                                        </p>
                                    </td>
                                    <td width="15%">
                                        <span>{{ citizen?.social_security_number }}</span>
                                    </td>
                                    <td width="15%">
                                        <span>{{ citizen?.phone }}</span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end justify-end gap-2">
                                            <Tooltip :text="$t('citizens.table.actions.view')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="navigateTo(`/citizens/${citizen.uuid}/journals`)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.table.actions.edit')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="navigateTo(`/citizens/${citizen.uuid}/edit`)"
                                                    v-if="userStore.getUser?.roles?.[0]?.name === 'Admin'">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.table.actions.latestJournalEntry')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="showCitizenNote(citizen)">
                                                    <Icon name="ph:note-blank" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <FormButton type="button"
                                                :buttonStyle="citizen.latest_risk_assessment === null && 'action' ||
                                                    citizen.latest_risk_assessment?.assessment === 'no risk' && 'no-risk' ||
                                                    citizen.latest_risk_assessment?.assessment === 'increased risk' && 'increased-risk' ||
                                                    citizen.latest_risk_assessment?.assessment === 'acute increased risk' && 'acute-increased-risk' || 'action'"
                                                class="rounded-md"
                                                @click="navigateTo(`/citizens/${citizen.uuid}/journals`)" :class="[
                                                    citizen.latest_risk_assessment?.assessment === 'no risk' && 'bg-green-700',
                                                    citizen.latest_risk_assessment?.assessment === 'increased risk' && 'bg-yellow-500',
                                                    citizen.latest_risk_assessment?.assessment === 'acute increased risk' && 'bg-red-600',
                                                    'rounded-md'
                                                ]">
                                                {{ $t('citizens.table.actions.latestRiskAssessment') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.citizens" @previous="previous" @next="next" />
                </div>
            </div>

            <ModulesUserCitizenModalPurchaseEmail :isModalOpen="state.modal.showPurchaseEmail"
                @close="state.modal.showPurchaseEmail = false" />
            <ModulesUserCitizenModalLatestJournal :isModalOpen="state.modal.showNote"
                :selectedCitizen="state.selectedCitizen" @close="state.modal.showNote = false" />

            <ModulesUserGuidedTourModalCitizens v-if="state.modal.isGuidedTourCitizensOverviewOpen"
                :isModalOpen="state.modal.isGuidedTourCitizensOverviewOpen" :isGuidedTour="false"
                @close="state.modal.isGuidedTourCitizensOverviewOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/user/CitizenService'
import { useDepartmentStore } from '@/store/department'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useCitizenStore } from '@/store/citizen'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const departmentStore = useDepartmentStore()
const customPagesStore = useCustomPagesStore() as any
const citizenStore = useCitizenStore() as any
const userStore = useUserStore() as any

const state = reactive({
    columnHeaders: [
        { name: 'citizens.table.name', sorter: true, key: 'firstname' },
        { name: 'citizens.table.email', sorter: true, key: 'email' },
        { name: 'citizens.table.ssn', sorter: true, key: 'ssn' },
        { name: 'citizens.table.phone', sorter: true, key: 'phone' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    citizens: [] as any,
    modal: {
        isGuidedTourCitizensOverviewOpen: false,
        showNote: false,
        showPurchaseEmail: false,
    },
    selectedCitizen: [],
})

onMounted(() => {
    fetchCitizens()
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchCitizens()
    }
})

function openGuidedTour() {
    state.modal.isGuidedTourCitizensOverviewOpen = true
}

async function fetchCitizens() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
            page: citizenStore.getCurrentPageNumber,
            page_length: citizenStore.getCurrentPageLength,
            sortField: citizenStore.getSortData.sortField,
            sortOrder: citizenStore.getSortData.sortOrder,
            ...state.dataFilter
        }
        const response = await citizenService.getCitizens(params)
        if (response) {
            state.citizens = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    const currentTablePage = citizenStore.getCurrentPageNumber - 1
    citizenStore.setCurrentPageNumber(currentTablePage)
    fetchCitizens()
}

function next() {
    const currentTablePage = citizenStore.getCurrentPageNumber + 1
    citizenStore.setCurrentPageNumber(currentTablePage)
    fetchCitizens()
}

function sort(sortingData: any) {
    citizenStore.setCurrentPageNumber(1)
    const sortField = sortingData.column
    const sortOrder = sortingData.sort
    citizenStore.setSortData(sortField, sortOrder)
    fetchCitizens()
}

function handleSearch(value: any) {
    citizenStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchCitizens()
}

function showCitizenNote(citizen: any) {
    state.selectedCitizen = citizen
    state.modal.showNote = true
}

function changePageLength(event: any) {
    citizenStore.setCurrentPageNumber(1)
    citizenStore.setCurrentPageLength(event.target.value)
    fetchCitizens()
}
</script>